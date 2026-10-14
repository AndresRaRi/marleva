import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const docker = (args, input) =>
  execFileSync('docker', args, { input, encoding: 'utf8', timeout: 30000 });
const name = 'marleva-b12-migration-' + Date.now();
const image = JSON.parse(docker(['inspect', 'supabase_db_marleva-m1']))[0].Image;
assert.match(image, /^sha256:[a-f0-9]{64}$/);
const migrations = readdirSync('apps/api/prisma/migrations')
  .filter((n) => /^\d{12}_/.test(n))
  .sort()
  .map((n) => ({ path: 'apps/api/prisma/migrations/' + n + '/migration.sql' }));
assert.equal(migrations.length, 4);
const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
for (const m of migrations) m.sha256 = hash(m.path);
const health = async () =>
  assert.equal(
    (await fetch('http://127.0.0.1:3000/health/ready', { signal: AbortSignal.timeout(5000) }))
      .status,
    200,
  );
await health();
const sqlArgs = [
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
];
const sql = (s) => docker(sqlArgs, s).trim();
let created = false;
const report = {
  date: new Date().toISOString(),
  case: 'MAR-M1-IT-BE-113-H',
  step: 'SEQ013:S075',
  image,
  migrations,
  cases: {},
  limits: [
    'Candidata SQL ficticia con transacción explícita; no runner Prisma ni rollback no transaccional',
    'Sin crash de servidor ni medición PF113',
  ],
};
try {
  docker([
    'run',
    '-d',
    '--pull=never',
    '--name',
    name,
    '--label',
    'marleva.b12.test=migration',
    '--network=none',
    '--memory=768m',
    '--cpus=1',
    '-e',
    'POSTGRES_PASSWORD=fixture-only',
    '--entrypoint=docker-entrypoint.sh',
    image,
    'postgres',
  ]);
  created = true;
  let ready = false;
  for (let i = 0; i < 120; i++) {
    try {
      docker(['exec', name, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']);
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  assert.ok(ready);
  sql(
    'CREATE SCHEMA marleva; CREATE ROLE marleva_api; CREATE TABLE marleva._prisma_migrations(id text);' +
      migrations.map((m) => readFileSync(m.path, 'utf8')).join('\n'),
  );
  const id = '11111111-1111-4111-8111-111111111111';
  sql(
    `INSERT INTO marleva."Account"(id,"authId",email) VALUES ('${id}','${id}','migration-b12@example.test'); INSERT INTO marleva."Notice"("accountId",kind,text) VALUES ('${id}','fixture','previo');`,
  );
  const before = sql(
    'SELECT md5(string_agg(t::text,\'\' ORDER BY t::text)) FROM marleva."Notice" t',
  );
  const candidate = `SET application_name='marleva_b12_interrupt'; BEGIN; CREATE TABLE marleva.b12_candidate(id integer PRIMARY KEY); INSERT INTO marleva.b12_candidate VALUES(1); SELECT pg_sleep(4); COMMIT;`;
  const child = spawn('docker', sqlArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
  const finished = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => resolve(code));
  });
  child.stdout.resume();
  child.stderr.resume();
  child.stdin.end(candidate);
  let pid;
  for (let i = 0; i < 60; i++) {
    pid = sql(
      "SELECT pid FROM pg_stat_activity WHERE application_name='marleva_b12_interrupt' AND wait_event='PgSleep'",
    );
    if (pid) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  assert.match(pid, /^\d+$/);
  assert.equal(sql(`SELECT pg_terminate_backend(${pid}::integer)`), 't');
  assert.notEqual(await finished, 0);
  assert.equal(sql("SELECT to_regclass('marleva.b12_candidate') IS NULL"), 't');
  assert.equal(
    sql('SELECT md5(string_agg(t::text,\'\' ORDER BY t::text)) FROM marleva."Notice" t'),
    before,
  );
  report.cases.cancelledTransactionRolledBack = true;
  sql(candidate);
  assert.equal(sql('SELECT count(*) FROM marleva.b12_candidate'), '1');
  assert.equal(
    sql('SELECT md5(string_agg(t::text,\'\' ORDER BY t::text)) FROM marleva."Notice" t'),
    before,
  );
  report.cases.sameCandidateReapplied = true;
  const info = JSON.parse(docker(['inspect', name]))[0];
  assert.equal(info.Config.Labels['marleva.b12.test'], 'migration');
  assert.equal(info.HostConfig.NetworkMode, 'none');
  assert.deepEqual(info.HostConfig.PortBindings, {});
  assert.ok(
    info.Mounts.every(
      (m) => !['supabase_db_marleva-m1', 'supabase_storage_marleva-m1'].includes(m.Name),
    ),
  );
  for (const m of migrations) assert.equal(hash(m.path), m.sha256);
  await health();
  report.cases.originalMigrationsAndSourceUntouched = true;
} catch (error) {
  report.error = error.message;
  throw error;
} finally {
  if (created) {
    const info = JSON.parse(docker(['inspect', name]))[0];
    assert.equal(info.Config.Labels['marleva.b12.test'], 'migration');
    docker(['rm', '-f', '-v', name]);
    report.disposableRemoved = true;
  }
  writeFileSync(
    'tests/results/recovery-migration' + (report.error ? '-failure' : '') + '.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
console.log('B12: interrupción transaccional y reaplicación comprobadas en PG desechable');
