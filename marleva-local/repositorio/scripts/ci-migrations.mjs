import { createRequire } from 'node:module';
import { parseEnv } from 'node:util';
import { readFileSync, readdirSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { assertMigrationTarget } from '../tests/fixtures/migration-target.mjs';
const pg = createRequire(new URL('../apps/api/package.json', import.meta.url))('pg');
const folder = path.resolve('artifacts/ci/stack');
const env = parseEnv(readFileSync(folder + '/.env', 'utf8'));
assertMigrationTarget(env);
const source = path.resolve('apps/api/prisma/migrations');
const names = readdirSync(source)
  .filter((name) => /^\d/.test(name))
  .sort();
if (names.length !== 6 || names.at(-1) !== '202610160001_email_change_owner')
  throw new Error('Revisar explícitamente el esquema previo del ensayo');
const hashes = () =>
  names.map((name) => ({
    name,
    sha256: createHash('sha256')
      .update(readFileSync(`${source}/${name}/migration.sql`))
      .digest('hex'),
  }));
const before = hashes();
function migrate(databaseUrl, previous = 0) {
  const directory = folder + '/upgrade-migrations-' + previous;
  if (previous) {
    mkdirSync(directory, { recursive: true });
    copyFileSync(source + '/migration_lock.toml', directory + '/migration_lock.toml');
    for (const name of names.slice(0, previous)) {
      mkdirSync(directory + '/' + name, { recursive: true });
      copyFileSync(`${source}/${name}/migration.sql`, `${directory}/${name}/migration.sql`);
    }
  }
  const migrations = previous ? directory : source;
  const config = folder + '/prisma.config.mjs';
  writeFileSync(
    config,
    `import {defineConfig} from 'prisma/config';\nexport default defineConfig({schema:${JSON.stringify(path.resolve('apps/api/prisma/schema.prisma'))},migrations:{path:${JSON.stringify(migrations)}},datasource:{url:process.env.MIGRATION_DATABASE_URL}});\n`,
  );
  const run = spawnSync(
    'pnpm',
    ['--filter', '@marleva/api', 'exec', 'prisma', 'migrate', 'deploy', '--config', config],
    {
      encoding: 'utf8',
      env: { ...process.env, ...env, MIGRATION_DATABASE_URL: databaseUrl },
      timeout: 120000,
    },
  );
  writeFileSync(
    folder + (previous ? '/previous-migration.log' : '/complete-migration.log'),
    run.stdout + run.stderr,
    { mode: 0o600 },
  );
  if (run.status !== 0) throw new Error('Falló Prisma; revisar log privado de migración');
}
const admin = new pg.Client({ connectionString: env.BOOTSTRAP_DATABASE_URL });
await admin.connect();
const outcomes = [];
try {
  const zeroDatabase = 'marleva_ci_zero_' + Date.now();
  await admin.query(`CREATE DATABASE ${zeroDatabase}`);
  const zeroUrl = new URL(env.MIGRATION_DATABASE_URL);
  zeroUrl.pathname = '/' + zeroDatabase;
  const zeroAdminUrl = new URL(env.BOOTSTRAP_DATABASE_URL);
  zeroAdminUrl.pathname = '/' + zeroDatabase;
  const zero = new pg.Client({ connectionString: zeroAdminUrl.toString() });
  await zero.connect();
  try {
    await zero.query('CREATE SCHEMA marleva AUTHORIZATION marleva_migrator');
    migrate(zeroUrl.toString());
    await zero.query('SET ROLE marleva_migrator');
    const count = await zero.query(
      'SELECT count(*)::int AS count FROM marleva._prisma_migrations WHERE finished_at IS NOT NULL',
    );
    if (count.rows[0].count !== 6) throw new Error('No se aplicaron las seis migraciones');
    await verifyEmailOwnerConstraint(zero);
  } finally {
    await zero.end();
  }
  outcomes.push({
    case: 'desde cero',
    applied: 6,
    ownerConstraintValidated: true,
    orphanRejected: true,
    status: 'PASS',
  });
  const operatorApi = new URL(env.DATABASE_URL);
  operatorApi.pathname = '/' + zeroDatabase;
  writeFileSync(
    folder + '/.env.operators',
    Object.entries({
      ...env,
      DATABASE_URL: operatorApi.toString(),
      MIGRATION_DATABASE_URL: zeroUrl.toString(),
    })
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n',
    { mode: 0o600 },
  );
  const database = 'marleva_ci_upgrade_' + Date.now();
  await admin.query(`CREATE DATABASE ${database}`);
  const bootstrap = new URL(env.BOOTSTRAP_DATABASE_URL);
  bootstrap.pathname = '/' + database;
  const upgrade = new pg.Client({ connectionString: bootstrap.toString() });
  await upgrade.connect();
  try {
    await upgrade.query('CREATE SCHEMA marleva AUTHORIZATION marleva_migrator');
    const target = new URL(env.MIGRATION_DATABASE_URL);
    target.pathname = '/' + database;
    migrate(target.toString(), 4);
    await upgrade.query('SET ROLE marleva_migrator');
    const id = randomUUID();
    await upgrade.query(
      'INSERT INTO marleva."Account" (id,"authId",email,operator,state,"createdAt") VALUES ($1,$1,$2,true,\'active\',now())',
      [id, 'ci-upgrade@example.test'],
    );
    const changeId = randomUUID();
    await upgrade.query(
      'INSERT INTO marleva."EmailChange" (id,"accountId","oldEmail","newEmail","providerTokens","expiresAt") VALUES ($1,$2,$3,$4,$5,now())',
      [
        changeId,
        id,
        'ci-upgrade@example.test',
        'ci-upgrade-next@example.test',
        'fixture-ciphertext',
      ],
    );
    migrate(target.toString(), 5);
    migrate(target.toString());
    await verifyEmailOwnerConstraint(upgrade);
    const change = await upgrade.query(
      'SELECT "accountId", "providerTokens" FROM marleva."EmailChange" WHERE id=$1',
      [changeId],
    );
    if (
      change.rowCount !== 1 ||
      change.rows[0].accountId !== id ||
      change.rows[0].providerTokens !== 'fixture-ciphertext'
    )
      throw new Error('No se conservó el cambio de correo previo');
    const roles = await upgrade.query(
      'SELECT a.operator, r.reason FROM marleva."Account" a JOIN marleva."RoleAssignment" r ON r."accountId"=a.id WHERE a.id=$1 AND r."revokedAt" IS NULL',
      [id],
    );
    if (roles.rowCount !== 1 || !roles.rows[0].operator)
      throw new Error('No se conservó el operador previo');
    outcomes.push({
      case: 'cuatro anteriores → quinta → sexta',
      applied: 6,
      operatorPreserved: true,
      emailChangePreserved: true,
      ownerConstraintValidated: true,
      orphanRejected: true,
      status: 'PASS',
    });
  } finally {
    await upgrade.end();
  }
  if (JSON.stringify(before) !== JSON.stringify(hashes()))
    throw new Error('Se modificó una migración original');
  migrate(env.MIGRATION_DATABASE_URL);
  writeFileSync(
    'tests/results/ci-migrations.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        outcomes,
        originals: before,
        limits: 'Prisma/PG17 aislados; no acredita restauración B12 ni producción',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    'Prisma: desde cero y actualización con datos previos correctos; originales inmutables.',
  );
} finally {
  await admin.end();
}
async function verifyEmailOwnerConstraint(client) {
  const constraint = await client.query(
    `SELECT convalidated,confdeltype,confupdtype FROM pg_constraint WHERE conname='EmailChange_accountId_fkey' AND conrelid='marleva."EmailChange"'::regclass`,
  );
  if (
    constraint.rowCount !== 1 ||
    !constraint.rows[0].convalidated ||
    constraint.rows[0].confdeltype !== 'a' ||
    constraint.rows[0].confupdtype !== 'a'
  )
    throw new Error('FK de cambio de correo ausente, no validada o con cascada');
  let rejected = false;
  try {
    await client.query(
      'INSERT INTO marleva."EmailChange" (id,"accountId","oldEmail","newEmail","providerTokens","expiresAt") VALUES ($1,$2,$3,$4,$5,now())',
      [
        randomUUID(),
        randomUUID(),
        'orphan@example.test',
        'orphan-next@example.test',
        'fixture-ciphertext',
      ],
    );
  } catch (error) {
    if (error.code !== '23503') throw error;
    rejected = true;
  }
  if (!rejected) throw new Error('Se aceptó un cambio sin cuenta');
}
