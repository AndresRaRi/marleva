import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import path from 'node:path';
import { createRequire } from 'node:module';
import { recoveryContext } from '../../../fixtures/recovery-context.mjs';

assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const pg = createRequire(new URL('../../../../apps/api/package.json', import.meta.url))('pg');
const context = recoveryContext();
assert.ok(context.isolated);
const copy = JSON.parse(readFileSync(context.report('copy')));
assert.equal(copy.names.prefix, context.names.prefix);
assert.equal(copy.cases.allThreeSchemaRows, true);
const attempt = String(Date.now());
const folder = path.resolve(context.folder, 'prisma-interruption-' + attempt);
mkdirSync(folder, { recursive: false, mode: 0o700 });
const name = context.names.prefix + '-prisma-' + attempt;
const docker = (args, input) =>
  execFileSync('docker', args, {
    input,
    encoding: 'utf8',
    timeout: 60000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
const inspect = () => JSON.parse(docker(['inspect', name]))[0];
const image = copy.sourceImages.find(
  (item) => item.name === '/supabase_db_' + context.project,
).image;
assert.match(image, /^sha256:[a-f0-9]{64}$/);
const networkName = context.names.prefix + '-host-access';
const network = JSON.parse(docker(['network', 'inspect', networkName]))[0];
assert.equal(network.Labels['marleva.b12.run'], context.run);
assert.equal(network.Options['com.docker.network.bridge.host_binding_ipv4'], '127.0.0.1');
assert.equal(network.Options['com.docker.network.bridge.enable_ip_masquerade'], 'false');
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const migrations = readdirSync('apps/api/prisma/migrations')
  .filter((item) => /^\d{12}_/.test(item))
  .sort();
assert.equal(migrations.length, 6);
assert.equal(migrations.at(-1), '202610160001_email_change_owner');
const baseline = migrations.map((item) => ({
  name: item,
  sha256: hash('apps/api/prisma/migrations/' + item + '/migration.sql'),
}));
cpSync('apps/api/prisma/migrations', folder + '/migrations', {
  recursive: true,
  errorOnExist: true,
  force: false,
});
writeFileSync(
  folder + '/prisma.config.mjs',
  `import {defineConfig} from 'prisma/config';\nexport default defineConfig({schema:${JSON.stringify(path.resolve('apps/api/prisma/schema.prisma'))},migrations:{path:${JSON.stringify(folder + '/migrations')}},datasource:{url:process.env.MARLEVA_PRISMA_TARGET}});\n`,
  { mode: 0o600 },
);
const password = randomBytes(24).toString('hex');
writeFileSync(folder + '/postgres.env', 'POSTGRES_PASSWORD=' + password + '\n', { mode: 0o600 });
const report = {
  date: new Date().toISOString(),
  case: 'MAR-M1-IT-BE-113-H-PRISMA',
  copyPrefix: copy.names.prefix,
  image,
  migrations: baseline,
  attempt,
  prismaVersion: JSON.parse(readFileSync('apps/api/node_modules/prisma/package.json')).version,
  cases: {},
  limits: [
    'Candidata transaccional explícita; no rollback de migraciones sin transacción ni crash del servidor',
    'Destino separado del ensayo restaurado; solo datos ficticios, sin aceptación de plataformas',
  ],
};
const startedAt = Date.now();
let created = false;
let child;
let env;
const sql = (text) =>
  docker(
    [
      'exec',
      '-i',
      name,
      'psql',
      '-h',
      '127.0.0.1',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-AtX',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    text,
  ).trim();
function prisma(args, stage, expected = 0) {
  try {
    const output = execFileSync(
      './scripts/tool',
      [
        'pnpm',
        '--filter',
        '@marleva/api',
        'exec',
        'prisma',
        ...args,
        '--config',
        folder + '/prisma.config.mjs',
      ],
      { env, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    writeFileSync(folder + '/' + stage + '.private.log', output, { mode: 0o600 });
    assert.equal(expected, 0, 'El runner debía bloquear esta etapa');
  } catch (error) {
    writeFileSync(
      folder + '/' + stage + '.private.log',
      String(error.stdout ?? '') + String(error.stderr ?? ''),
      { mode: 0o600 },
    );
    if (expected === 0 || !Number.isInteger(error.status) || error.status === 0) throw error;
    assert.ok(
      (String(error.stdout ?? '') + String(error.stderr ?? '')).includes(expected),
      'Código de fallo Prisma distinto del esperado',
    );
  }
}
try {
  docker([
    'create',
    '--pull=never',
    '--name',
    name,
    '--label',
    'marleva.b12.run=' + context.run,
    '--network',
    networkName,
    '--memory=512m',
    '--cpus=1',
    '-p',
    '127.0.0.1::5432',
    '--env-file',
    folder + '/postgres.env',
    '--entrypoint=docker-entrypoint.sh',
    image,
    'postgres',
    '-c',
    'listen_addresses=0.0.0.0',
  ]);
  created = true;
  docker(['start', name]);
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      sql('SELECT 1');
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  assert.ok(ready, 'PG propio no quedó listo');
  const target = inspect();
  assert.equal(target.Config.Labels['marleva.b12.run'], context.run);
  assert.equal(target.Image, image);
  assert.ok(
    target.Mounts.every(
      (mount) =>
        ![
          context.names.pgTarget,
          context.names.pgBackup,
          'supabase_db_' + context.project,
        ].includes(mount.Name),
    ),
  );
  const binding = target.NetworkSettings.Ports['5432/tcp'];
  assert.equal(binding.length, 1);
  assert.equal(binding[0].HostIp, '127.0.0.1');
  assert.match(binding[0].HostPort, /^\d{4,5}$/);
  const url = new URL(
    'postgresql://postgres@127.0.0.1:' + binding[0].HostPort + '/postgres?schema=marleva',
  );
  url.password = password;
  env = { ...process.env, MARLEVA_PRISMA_TARGET: url.toString() };
  assert.equal(sql('SHOW listen_addresses'), '0.0.0.0');
  const hostConnection = new pg.Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 5000,
  });
  try {
    await hostConnection.connect();
    await hostConnection.query('SELECT 1');
  } finally {
    await hostConnection.end();
  }
  for (const migration of baseline)
    assert.equal(
      hash(folder + '/migrations/' + migration.name + '/migration.sql'),
      migration.sha256,
    );
  sql('CREATE ROLE marleva_api; CREATE SCHEMA marleva;');
  prisma(['migrate', 'deploy'], 'baseline');
  assert.equal(
    sql('SELECT count(*) FROM marleva._prisma_migrations WHERE finished_at IS NOT NULL'),
    String(migrations.length),
  );
  const id = randomUUID();
  sql(
    `INSERT INTO marleva."Account"(id,"authId",email) VALUES('${id}','${id}','prisma-b12@example.test'); INSERT INTO marleva."Notice"("accountId",kind,text) VALUES('${id}','fixture','previo');`,
  );
  const notices = () =>
    sql('SELECT md5(string_agg(t::text,\'\' ORDER BY t::text)) FROM marleva."Notice" t');
  const before = notices();
  const candidate = '202610160002_b12_prisma_interrupt';
  mkdirSync(folder + '/migrations/' + candidate);
  const candidateFile = folder + '/migrations/' + candidate + '/migration.sql';
  const application = 'b12_prisma_' + context.run;
  writeFileSync(
    candidateFile,
    `BEGIN; SET LOCAL application_name='${application}'; CREATE TABLE marleva.b12_candidate(id integer PRIMARY KEY); INSERT INTO marleva.b12_candidate VALUES(1); SELECT pg_sleep(20); COMMIT;\n`,
    { mode: 0o600 },
  );
  const candidateHash = hash(candidateFile);
  child = spawn(
    './scripts/tool',
    [
      'pnpm',
      '--filter',
      '@marleva/api',
      'exec',
      'prisma',
      'migrate',
      'deploy',
      '--config',
      folder + '/prisma.config.mjs',
    ],
    { env, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const output = [];
  child.stdout.on('data', (chunk) => output.push(chunk));
  child.stderr.on('data', (chunk) => output.push(chunk));
  const ended = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  let pid;
  for (let attempt = 0; attempt < 100; attempt++) {
    pid = sql(
      `SELECT pid FROM pg_stat_activity WHERE application_name='${application}' AND datname='postgres' AND wait_event='PgSleep'`,
    );
    if (pid) break;
    assert.equal(child.exitCode, null, 'Runner terminó antes de la interrupción');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.match(pid, /^\d+$/);
  assert.equal(sql(`SELECT pg_terminate_backend(${pid}::integer)`), 't');
  assert.notEqual(await ended, 0);
  writeFileSync(folder + '/interrupted.private.log', Buffer.concat(output), { mode: 0o600 });
  assert.equal(sql("SELECT to_regclass('marleva.b12_candidate') IS NULL"), 't');
  assert.equal(notices(), before);
  assert.equal(
    sql(
      `SELECT count(*) FROM marleva._prisma_migrations WHERE migration_name='${candidate}' AND finished_at IS NULL AND rolled_back_at IS NULL`,
    ),
    '1',
  );
  report.cases.prismaFailureAndSqlRollbackPreservePreviousData = true;
  prisma(['migrate', 'deploy'], 'blocked-after-failure', 'P3009');
  report.cases.failedMigrationBlocksBlindRetry = true;
  prisma(['migrate', 'resolve', '--rolled-back', candidate], 'resolve-confirmed-rollback');
  prisma(['migrate', 'deploy'], 'reapply-same-candidate');
  assert.equal(hash(candidateFile), candidateHash);
  assert.equal(sql('SELECT count(*) FROM marleva.b12_candidate'), '1');
  assert.equal(
    sql('SELECT count(*) FROM marleva._prisma_migrations WHERE finished_at IS NOT NULL'),
    String(migrations.length + 1),
  );
  assert.equal(notices(), before);
  for (const migration of baseline)
    assert.equal(
      hash('apps/api/prisma/migrations/' + migration.name + '/migration.sql'),
      migration.sha256,
    );
  report.cases.sameCandidateResolvedAndAppliedWithOriginalMigrationsIntact = true;
  report.candidateSha256 = candidateHash;
  report.result = 'PASS';
} catch (error) {
  report.result = 'FAIL';
  report.error = 'Etapa Prisma falló; detalle privado conservado';
  writeFileSync(folder + '/failure.private.log', String(error.stack), { mode: 0o600 });
  process.exitCode = 1;
} finally {
  if (child && child.exitCode === null) child.kill('SIGTERM');
  if (created) {
    assert.equal(inspect().Config.Labels['marleva.b12.run'], context.run);
    docker(['stop', '--time', '20', name]);
    report.containerStoppedAndVolumePreserved = true;
  }
  report.durationMs = Date.now() - startedAt;
  writeFileSync(
    context.report('prisma-' + attempt + (report.result === 'FAIL' ? '-failure' : '')),
    JSON.stringify(report, null, 2) + '\n',
  );
  // The stable report belongs to the historical five-migration rehearsal.
  // Keep it intact; each new baseline/candidate has its own attempt report above.
}
console.log('B12 Prisma: ' + report.result);
