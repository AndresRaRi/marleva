import { recoveryContext } from '../../../fixtures/recovery-context.mjs';
const context = recoveryContext();
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, chmodSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import {
  recoveryNames,
  assertRecoverySource,
  assertRecoveryCopy,
  assertRecoveryManifest,
} from '../../../fixtures/recovery-guard.mjs';
process.chdir(path.resolve(new URL('../../../..', import.meta.url).pathname));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1', 'Requiere ensayo local autorizado');
const verifyExisting = process.argv[2] === 'verify-existing';
if (verifyExisting) assert.ok(context.isolated, 'Solo contexto B12 aislado');
const repeatWithAttributes = process.env.MARLEVA_RECOVERY_ATTRIBUTES === '1';
const reportFile = context.isolated
  ? context.report('copy')
  : repeatWithAttributes
    ? 'tests/results/recovery-copy-with-attributes.json'
    : 'tests/results/recovery-copy.json';
const run = context.run ?? String(Date.now()),
  names = recoveryNames(run),
  started = Date.now();
const privateDir = 'artifacts/recovery/' + names.prefix;
mkdirSync(privateDir, { recursive: true, mode: 0o700 });
chmodSync(privateDir, 0o700);
const docker = (args) =>
  execFileSync('docker', args, {
    encoding: 'utf8',
    timeout: verifyExisting ? 180000 : 60000,
    maxBuffer: 20000000,
  });
const inspect = (name) => JSON.parse(docker(['inspect', name]))[0];
const sourceDb = 'supabase_db_' + context.project,
  sourceStorage = 'supabase_storage_' + context.project;
const sourceVolumes = {
  supabase_db_marleva_m1: sourceDb,
  supabase_storage_marleva_m1: sourceStorage,
};
const services = (
  context.isolated
    ? ['storage', 'rest', 'inbucket', 'auth', 'kong']
    : ['pg_meta', 'storage', 'rest', 'realtime', 'inbucket', 'auth', 'kong']
).map((s) => 'supabase_' + s + '_' + context.project);
const sources = [sourceDb, ...services].map(inspect);
if (context.isolated) {
  for (const source of sources) {
    assert.equal(source.Config.Labels['com.supabase.cli.project'], context.project);
    assert.equal(
      source.Config.Labels['com.supabase.cli.workdir'],
      path.resolve('artifacts/recovery/source-006'),
    );
  }
  let serving = false;
  try {
    serving = (
      await fetch(context.sourceApi + '/health/live', { signal: AbortSignal.timeout(1000) })
    ).ok;
  } catch {
    /* No API writes are allowed during the copy. */
  }
  assert.equal(serving, false, 'Detener exclusivamente API del origen de ensayo antes de copiar');
}

assert.ok(
  sources.every((s) => s.State.Running),
  'El origen debe comenzar activo',
);
assertRecoverySource(sources[0], sourceDb, sourceDb, '/var/lib/postgresql/data', context.network);
const storage = sources.find((s) => s.Name === '/' + sourceStorage);
assertRecoverySource(storage, sourceStorage, sourceStorage, '/mnt', context.network);
if (!verifyExisting)
  for (const name of Object.values(names)) {
    for (const kind of ['container', 'volume', 'network']) {
      const found = execFileSync(
        'docker',
        [
          kind,
          'ls',
          ...(kind === 'container' ? ['-a'] : []),
          '--format',
          kind === 'container' ? '{{.Names}}' : '{{.Name}}',
        ],
        {
          encoding: 'utf8',
        },
      )
        .trim()
        .split('\n');
      assert.ok(!found.includes(name), 'Destino existente: ' + name);
    }
  }
const sql = (container, text) =>
  docker([
    'exec',
    container,
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-AtX',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    text,
  ]).trim();
assert.equal(
  sql(sourceDb, `SELECT count(*) FROM marleva."Account" WHERE email NOT LIKE '%@example.test'`),
  '0',
  'Solo datos ficticios',
);
assert.equal(
  sql(
    sourceDb,
    `SELECT count(*) FROM auth.users WHERE email IS NOT NULL AND email NOT LIKE '%@example.test'`,
  ),
  '0',
  'Solo identidades ficticias',
);
function rows(container) {
  const tables = sql(
    container,
    "SELECT schemaname||'.'||tablename FROM pg_tables WHERE schemaname IN ('marleva','auth','storage') ORDER BY 1",
  )
    .split('\n')
    .filter(Boolean);
  return tables.map((full) => {
    const [schema, table] = full.split('.');
    assert.match(schema, /^[a-zA-Z_]+$/);
    assert.match(table, /^[a-zA-Z_][a-zA-Z0-9_]*$/);
    const [count, hash] = sql(
      container,
      `SET TIME ZONE 'UTC'; SELECT count(*)||':'||coalesce(md5(string_agg(row_text, E'\\n' ORDER BY row_text)),md5('')) FROM (SELECT t::text row_text FROM "${schema}"."${table}" t) rows`,
    )
      .split('\n')
      .at(-1)
      .split(':');
    return { schema, table, count: Number(count), hash };
  });
}
const helperBase = [
  'run',
  '--rm',
  '--pull=never',
  '--network=none',
  '--read-only',
  '--memory=256m',
  '--cpus=1',
  '--cap-drop=ALL',
  '--cap-add=DAC_OVERRIDE',
  '--cap-add=CHOWN',
  '--cap-add=FOWNER',
  '--security-opt=no-new-privileges',
  '--entrypoint=sh',
];
function manifest(volume) {
  const links = docker([
    ...helperBase,
    '--mount',
    `type=volume,src=${volume},dst=/data,readonly`,
    sources[0].Image,
    '-c',
    'find /data -type l -print',
  ]);
  assert.equal(links.trim(), '', 'Symlinks/tablaspaces requieren revisión');
  const result = docker([
    ...helperBase,
    '--mount',
    `type=volume,src=${volume},dst=/data,readonly`,
    sources[0].Image,
    '-c',
    'cd /data && find . -type f -exec sha256sum {} + | sort',
  ]);
  return result;
}
function copy(from, to) {
  assertRecoveryCopy(from, to, names, sourceVolumes);
  docker(['volume', 'create', '--label', 'marleva.b12.run=' + run, to]);
  docker([
    ...helperBase,
    '--mount',
    `type=volume,src=${from},dst=/source,readonly`,
    '--mount',
    `type=volume,src=${to},dst=/destination`,
    sources[0].Image,
    '-c',
    'cp -a /source/. /destination/',
  ]);
  assertRecoveryManifest(manifest(from), manifest(to));
  if ([sourceStorage, names.storageBackup].includes(from)) {
    const script = path.resolve('tests/fixtures/recovery-xattrs.mjs');
    const args = [
      ...helperBase.slice(0, -2),
      '--entrypoint=node',
      '--mount',
      `type=volume,src=${from},dst=/source,readonly`,
      '--mount',
      `type=volume,src=${to},dst=/destination`,
      '--mount',
      `type=bind,src=${script},dst=/helper.mjs,readonly`,
      storage.Image,
      '/helper.mjs',
      'copy',
      '/source',
      '/destination',
    ];
    const expected = docker(args);
    const actual = docker([
      ...helperBase.slice(0, -2),
      '--entrypoint=node',
      '--mount',
      `type=volume,src=${to},dst=/source,readonly`,
      '--mount',
      `type=bind,src=${script},dst=/helper.mjs,readonly`,
      storage.Image,
      '/helper.mjs',
      'manifest',
      '/source',
    ]);
    assertRecoveryManifest(expected, actual);
    privateFile(to + '-xattrs.json', expected);
  }
}
const privateFile = (name, data) => writeFileSync(privateDir + '/' + name, data, { mode: 0o600 });
let report = {
  date: new Date().toISOString(),
  phase: 'B12 copia física; parcial113-A/G',
  names,
  sourceImages: sources.map((s) => ({ name: s.Name, image: s.Image })),
  cases: {},
  limits: [
    'Sin API Auth/Storage/permisos/revocación/borrado posterior/MFA/cliente',
    'Sin RPO/RTO ni capacidad productiva; recursos helper configurados, no CPU/RAM medidas',
  ],
};
let paused = false,
  before;
async function ready(container) {
  for (let i = 0; i < 120; i++) {
    try {
      if (
        docker(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']).includes(
          'accepting',
        )
      )
        return;
    } catch {
      // A stopped/starting PG process is expected here; the loop has a deadline.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('PG no quedó listo');
}
if (!verifyExisting)
  try {
    console.log('B12: origen identificado; destino nuevo sin puertos');
    paused = true;
    if (!context.isolated)
      execFileSync('./scripts/tool', ['node', 'scripts/local.mjs', 'stop', 'api'], {
        stdio: 'pipe',
        timeout: 20000,
      });
    docker(['stop', '--time', '20', ...services]);
    before = rows(sourceDb);
    const availableIds = new Set(
      sql(sourceDb, 'SELECT id FROM marleva."PrivateFixture" WHERE state=\'available\'').split(
        '\n',
      ),
    );
    privateFile('rows-before.json', JSON.stringify(before, null, 2));
    const pauseStart = Date.now();
    docker(['stop', '--time', '30', sourceDb]);
    const stopped = inspect(sourceDb);
    assert.equal(stopped.State.Running, false);
    assert.equal(stopped.State.ExitCode, 0, 'PG debe cerrar limpiamente');
    copy(sourceDb, names.pgBackup);
    copy(sourceStorage, names.storageBackup);
    copy(names.pgBackup, names.pgTarget);
    copy(names.storageBackup, names.storageTarget);
    const pgManifest = manifest(names.pgBackup),
      storageManifest = manifest(names.storageBackup);
    const dataset = JSON.parse(readFileSync(context.fixture, 'utf8'));
    assert.equal(dataset.files.length, 3, 'Preparar los tres objetos del ensayo');
    const expectedFiles =
      repeatWithAttributes && !context.isolated
        ? dataset.files.filter((file) => availableIds.has(file.id))
        : dataset.files;
    assert.ok(expectedFiles.length > 0, 'No acreditar contenido con Storage vacío');
    for (const file of expectedFiles)
      assert.ok(storageManifest.includes(file.sha256 + ' '), 'Falta contenido esperado en Storage');
    report.fixtureBytes = expectedFiles.reduce((sum, file) => sum + file.bytes, 0);
    report.expectedLiveFixtures = expectedFiles.length;
    report.cases.storageAttributes = true;
    privateFile('pg-manifest.txt', pgManifest);
    privateFile('storage-manifest.txt', storageManifest);
    report.backup = {
      pause_ms: Date.now() - pauseStart,
      pgFiles: pgManifest.trim().split('\n').filter(Boolean).length,
      storageFiles: storageManifest.trim().split('\n').filter(Boolean).length,
      pgManifestSha256: createHash('sha256').update(pgManifest).digest('hex'),
      storageManifestSha256: createHash('sha256').update(storageManifest).digest('hex'),
    };
    report.cases.completeVolumeCopy = true;
    report.sourceProject = context.project;
    report.fixturePrefix = dataset.prefix;
    console.log('B12: copias y hashes coinciden; reanudando origen');
  } catch (error) {
    report.error = error.message;
    throw error;
  } finally {
    if (paused) {
      docker(['start', sourceDb]);
      await ready(sourceDb);
      docker(['start', ...services]);
      if (!context.isolated)
        execFileSync('./scripts/tool', ['node', 'scripts/local.mjs', 'start', 'api'], {
          stdio: 'pipe',
          timeout: 20000,
        });
      report.sourceResumed = true;
    }
    privateFile('phase-copy.json', JSON.stringify(report, null, 2));
    if (report.error)
      writeFileSync(
        context.report(verifyExisting ? 'copy-verify-failure' : 'copy-failure'),
        JSON.stringify(report, null, 2) + '\n',
      );
  }
if (verifyExisting) {
  const previous = JSON.parse(readFileSync(privateDir + '/phase-final.json', 'utf8'));
  assert.equal(previous.cases.completeVolumeCopy, true);
  assert.equal(previous.cases.storageAttributes, true);
  assert.deepEqual(previous.names, names);
  assert.deepEqual(previous.sourceImages, report.sourceImages);
  assert.equal(previous.sourceResumed, true);
  assert.equal(previous.targetStopped, true);
  const { error: previousError, ...completed } = previous;
  assert.ok(previousError, 'Reanudación reservada a verificación fallida');
  report = {
    ...completed,
    resumedVerificationAt: new Date().toISOString(),
    previousFailure: context.report('copy-failure'),
  };
  before = JSON.parse(readFileSync(privateDir + '/rows-before.json', 'utf8'));
}
try {
  if (verifyExisting) {
    const existing = inspect(names.db);
    assert.equal(existing.State.Running, false);
    assert.equal(existing.Config.Labels['marleva.b12.run'], run);
    assert.equal(existing.Image, sources[0].Image);
    assert.equal(existing.Mounts.length, 1);
    assert.equal(existing.Mounts[0].Name, names.pgTarget);
    assert.deepEqual(existing.HostConfig.PortBindings, {});
    const network = JSON.parse(docker(['network', 'inspect', names.network]))[0];
    assert.equal(network.Internal, true);
    assert.equal(network.Labels['marleva.b12.run'], run);
    assertRecoveryManifest(
      readFileSync(privateDir + '/pg-manifest.txt', 'utf8'),
      manifest(names.pgBackup),
    );
    assertRecoveryManifest(
      readFileSync(privateDir + '/storage-manifest.txt', 'utf8'),
      manifest(names.storageBackup),
    );
    docker(['start', names.db]);
  } else {
    docker(['network', 'create', '--internal', '--label', 'marleva.b12.run=' + run, names.network]);
    privateFile('db.env', sources[0].Config.Env.join('\n') + '\n');
    docker([
      'run',
      '-d',
      '--pull=never',
      '--name',
      names.db,
      '--label',
      'marleva.b12.run=' + run,
      '--network',
      names.network,
      '--memory=768m',
      '--cpus=1',
      '--env-file',
      privateDir + '/db.env',
      '--mount',
      `type=volume,src=${names.pgTarget},dst=/var/lib/postgresql/data`,
      '--entrypoint',
      'docker-entrypoint.sh',
      sources[0].Image,
      'postgres',
      '-D',
      '/etc/postgresql',
    ]);
  }
  await ready(names.db);
  const restored = rows(names.db);
  privateFile('rows-restored.json', JSON.stringify(restored, null, 2));
  assertRecoveryManifest(before, restored);
  report.cases.allThreeSchemaRows = true;
  assert.equal(
    sql(
      names.db,
      'SELECT count(*) FROM marleva."Account" a LEFT JOIN auth.users u ON a."authId"=u.id WHERE u.id IS NULL',
    ),
    '0',
  );
  assert.equal(
    sql(
      names.db,
      'SELECT count(*) FROM marleva."Session" s LEFT JOIN marleva."Account" a ON s."accountId"=a.id WHERE a.id IS NULL',
    ),
    '0',
  );
  report.cases.accountIdentitySessionLinks = true;
  report.schemas = ['marleva', 'auth', 'storage'].map((schema) => ({
    schema,
    tables: before.filter((x) => x.schema === schema).length,
    rows: before.filter((x) => x.schema === schema).reduce((sum, x) => sum + x.count, 0),
  }));
  const currentStorage = manifest(names.storageTarget);
  assertRecoveryManifest(manifest(names.storageBackup), currentStorage);
  report.cases.storageHashes = true;
  // Fault injection is confined to the comparison input; no source or target object removed.
  assert.throws(() => assertRecoveryManifest(currentStorage, currentStorage + 'incomplete'));
  report.cases.corruptManifestBlocked = true;
  assert.deepEqual(inspect(names.db).HostConfig.PortBindings, {});
  report.cases.targetNoPublishedPorts = true;
  console.log('B12: PG restaurado; filas e identidad coinciden y Storage conserva hashes');
} catch (error) {
  report.error = error.message;
  writeFileSync(
    context.report(verifyExisting ? 'copy-verify-failure' : 'copy-failure'),
    JSON.stringify(report, null, 2) + '\n',
  );
  throw error;
} finally {
  try {
    if (inspect(names.db).State.Running) docker(['stop', '--time', '20', names.db]);
    report.targetStopped = !inspect(names.db).State.Running;
  } catch (error) {
    report.targetStopError = error.message;
    report.error ??= 'No se comprobó destino detenido';
    writeFileSync(
      context.report(verifyExisting ? 'copy-verify-failure' : 'copy-failure'),
      JSON.stringify(report, null, 2) + '\n',
    );
  }
  if (verifyExisting) report.verification_duration_ms = Date.now() - started;
  else report.duration_ms = Date.now() - started;
  privateFile('phase-final.json', JSON.stringify(report, null, 2));
  if (!report.error) writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
}
if (report.error) throw new Error(report.error);
