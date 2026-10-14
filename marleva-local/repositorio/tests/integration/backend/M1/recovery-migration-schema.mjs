import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const name = 'marleva-mfa-schema-' + Date.now();
const copy = JSON.parse(readFileSync('tests/results/recovery-copy.json'));
const image = copy.sourceImages.find((i) => i.name === '/supabase_db_marleva-m1').image;
const docker = (args, input) =>
  execFileSync('./scripts/tool', ['docker', ...args], {
    input,
    encoding: 'utf8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
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
      '-v',
      'ON_ERROR_STOP=1',
      '-At',
    ],
    text,
  );
const files = [
  '202610120001_m1',
  '202610120002_m1_tables',
  '202610130001_notice_cursor',
  '202610130002_private_fixtures',
];
const hashes = Object.fromEntries(
  files.map((n) => [
    n,
    createHash('sha256')
      .update(readFileSync('apps/api/prisma/migrations/' + n + '/migration.sql'))
      .digest('hex'),
  ]),
);
const report = {
  date: new Date().toISOString(),
  id: 'MAR-M1-IT-BE-114-MIGRATION',
  cases: {},
  image,
  hashes,
};
let created = false;
try {
  docker([
    'run',
    '--pull=never',
    '--rm',
    '-d',
    '--name',
    name,
    '--network',
    'none',
    '--memory',
    '768m',
    '-e',
    'POSTGRES_PASSWORD=fixture-only',
    '--entrypoint',
    'docker-entrypoint.sh',
    image,
    'postgres',
  ]);
  created = true;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      sql('SELECT 1;');
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  assert.ok(ready);
  sql(
    'CREATE SCHEMA marleva; CREATE ROLE marleva_api; CREATE TABLE marleva._prisma_migrations(id text);',
  );
  for (const file of files)
    sql(readFileSync('apps/api/prisma/migrations/' + file + '/migration.sql', 'utf8'));
  sql(
    `INSERT INTO marleva."Account"(id,"authId",email,operator) VALUES ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','schema-mfa@example.test',true);`,
  );
  const before = sql('SELECT id,email,operator FROM marleva."Account";');
  const migration = readFileSync(
    'apps/api/prisma/migrations/202610140001_mfa_recovery/migration.sql',
    'utf8',
  );
  sql(migration);
  assert.equal(sql('SELECT id,email,operator FROM marleva."Account";'), before);
  assert.equal(sql('SELECT count(*) FROM marleva."RoleAssignment";').trim(), '1');
  report.cases.existingOperatorAndAccountPreserved = true;
  sql(`UPDATE marleva."Account" SET operator=false;`);
  assert.equal(sql('SELECT operator FROM marleva."Account";').trim(), 't');
  sql(`UPDATE marleva."RoleAssignment" SET "revokedAt"=now(),"revokedBy"="accountId";`);
  assert.equal(sql('SELECT operator FROM marleva."Account";').trim(), 'f');
  sql(`UPDATE marleva."Account" SET operator=true;`);
  assert.equal(sql('SELECT operator FROM marleva."Account";').trim(), 'f');
  report.cases.booleanProjectionCannotGrantOrHideActiveRole = true;
  assert.equal(
    sql(
      `SELECT count(*) FROM information_schema.tables WHERE table_schema='marleva' AND table_name<>'_prisma_migrations';`,
    ).trim(),
    '13',
  );
  report.cases.thirteenBusinessTables = true;
  for (const n of files)
    assert.equal(
      createHash('sha256')
        .update(readFileSync('apps/api/prisma/migrations/' + n + '/migration.sql'))
        .digest('hex'),
      hashes[n],
    );
  report.cases.appliedOriginalHashesUnchanged = true;
  report.result = 'PASS';
  console.log('UC014: migración aislada, preservación y autoridad única de roles pasaron');
} catch (error) {
  report.result = 'FAIL';
  report.error =
    error instanceof assert.AssertionError
      ? error.message
      : 'Error SQL de ensayo; no aplicado al origen';
  process.exitCode = 1;
} finally {
  if (created) {
    try {
      docker(['stop', '--time', '10', name]);
    } catch {
      report.cleanup = 'El contenedor propio ya terminó; comprobar ausencia';
    }
  }
  writeFileSync(
    'tests/results/recovery-schema' + (report.result === 'FAIL' ? '-failure' : '') + '.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
