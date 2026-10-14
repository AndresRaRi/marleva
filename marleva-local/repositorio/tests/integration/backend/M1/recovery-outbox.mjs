import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
process.loadEnvFile('.env');
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const copy = JSON.parse(readFileSync('tests/results/recovery-copy.json'));
const stack = JSON.parse(
  readFileSync(`artifacts/recovery/${copy.names.prefix}/provider/stack.private.json`),
);
assert.equal(stack.copyPrefix, copy.names.prefix);
const tool = process.cwd() + '/scripts/tool';
const docker = (args, input) =>
  execFileSync(tool, ['docker', ...args], {
    input,
    encoding: 'utf8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
const capture = JSON.parse(docker(['inspect', stack.names.inbucket]))[0];
assert.equal(capture.Config.Labels['marleva.b12.run'], stack.run);
assert.ok(capture.State.Running);
assert.ok(
  capture.HostConfig.PortBindings['1025/tcp'].some(
    (p) => p.HostIp === '127.0.0.1' && p.HostPort === '54425',
  ),
);
const name = 'marleva-b12-outbox-' + Date.now(),
  folder = 'artifacts/recovery/' + name;
mkdirSync(folder, { recursive: true, mode: 0o700 });
const report = {
  id: 'MAR-M1-IT-BE-113-F',
  date: new Date().toISOString(),
  cases: {},
  limits: [
    'PG dump/restore de marleva en bases ficticias aisladas; no recuperación integral Auth/Storage/MFA/cliente',
    'Reloj adelanta 300s para backoff del dataset',
    'SMTP puede repetir entrega tras aceptación sin ACK; no exactamente una vez',
  ],
};
const started = Date.now();
let created = false,
  stopped = false,
  seed,
  db;
const sql = (database, text) =>
  docker(
    [
      'exec',
      '-e',
      'PGPASSWORD=fixture-only',
      '-i',
      name,
      'psql',
      '-h',
      '127.0.0.1',
      '-U',
      'postgres',
      '-d',
      database,
      '-v',
      'ON_ERROR_STOP=1',
    ],
    text,
  );
async function ready(database) {
  for (let i = 0; i < 100; i++) {
    try {
      sql(database, 'SELECT 1;');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw Error('PG no listo');
}
async function captured(url) {
  return (await (await fetch(url + '/api/v1/messages')).json()).messages.filter((m) =>
    m.Subject.startsWith(name),
  );
}
const business = (x) =>
  x.$queryRawUnsafe(
    'SELECT row_to_json(a)::text AS value FROM marleva."Account" a UNION ALL SELECT row_to_json(e)::text FROM marleva."EmailChange" e UNION ALL SELECT row_to_json(n)::text FROM marleva."Notice" n ORDER BY value',
  );
try {
  const image = copy.sourceImages.find((i) => i.name === '/supabase_db_marleva-m1').image;
  report.image = image;
  docker([
    'run',
    '--pull=never',
    '--rm',
    '-d',
    '--name',
    name,
    '--label',
    'marleva.b12.outbox=' + name,
    '--memory',
    '768m',
    '--cpus',
    '1',
    '-p',
    '127.0.0.1::5432',
    '-e',
    'POSTGRES_PASSWORD=fixture-only',
    '--entrypoint',
    'docker-entrypoint.sh',
    image,
    'postgres',
    '-c',
    'listen_addresses=0.0.0.0',
  ]);
  created = true;
  const port = docker(['port', name, '5432/tcp']).trim().split(':').at(-1);
  await ready('postgres');
  sql('postgres', 'CREATE ROLE marleva_api;');
  sql('postgres', 'CREATE DATABASE recovery_seed;');
  sql('postgres', 'CREATE DATABASE recovery_restored;');
  sql('recovery_seed', 'CREATE SCHEMA marleva; CREATE TABLE marleva._prisma_migrations(id text);');
  sql(
    'recovery_seed',
    readFileSync('apps/api/prisma/migrations/202610120002_m1_tables/migration.sql', 'utf8'),
  );
  Object.assign(process.env, stack.environment, {
    SMTP_PORT: '54425',
    DATABASE_URL: `postgresql://postgres:fixture-only@127.0.0.1:${port}/recovery_seed`,
  });
  const { database } = await import('../../../../apps/api/dist/database.js');
  seed = database();
  const clock = new Date(),
    accountId = randomUUID();
  await seed.account.create({
    data: { id: accountId, authId: randomUUID(), email: 'recovery-outbox@example.test' },
  });
  await seed.emailChange.create({
    data: {
      accountId,
      oldEmail: 'old@example.test',
      newEmail: 'recovery-outbox@example.test',
      providerTokens: 'fixture-only',
      state: 'complete',
      oldConfirmed: true,
      newConfirmed: true,
      expiresAt: new Date(+clock + 600000),
    },
  });
  await seed.notice.create({
    data: { accountId, kind: 'email_changed', text: 'Cambio ficticio completado' },
  });
  const jobs = [];
  for (const kind of ['pending', 'sending', 'expired'])
    jobs.push(
      await seed.outbox.create({
        data: {
          reference: randomUUID(),
          recipient: 'recovery-outbox@example.test',
          subject: name + '-' + kind,
          text: 'Aviso ficticio restaurado',
          state: kind === 'sending' ? 'sending' : 'pending',
          attempts: kind === 'sending' ? 1 : 0,
          leaseUntil: kind === 'sending' ? new Date(+clock - 1000) : null,
          dueAt: new Date(+clock - 1000),
          createdAt: new Date(+clock - (kind === 'expired' ? 86400001 : 1000)),
        },
      }),
    );
  const snapshot = await business(seed);
  const dump = docker([
    'exec',
    '-e',
    'PGPASSWORD=fixture-only',
    name,
    'pg_dump',
    '-h',
    '127.0.0.1',
    '-U',
    'postgres',
    '-d',
    'recovery_seed',
    '--schema=marleva',
    '--no-owner',
    '--no-acl',
  ]);
  writeFileSync(folder + '/snapshot.private.sql', dump, { mode: 0o600 });
  sql('recovery_restored', dump);
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('recovery_seed', 'recovery_restored');
  db = database();
  assert.deepEqual(
    await db.outbox.findMany({ orderBy: { id: 'asc' } }),
    await seed.outbox.findMany({ orderBy: { id: 'asc' } }),
  );
  report.cases.snapshotAndRestoredQueueIdentical = true;
  await seed.$disconnect();
  seed = undefined;
  await db.$disconnect();
  db = undefined;
  docker(['restart', name]);
  await ready('recovery_restored');
  const restartedPort = docker(['port', name, '5432/tcp']).trim().split(':').at(-1);
  const destination = new URL(process.env.DATABASE_URL);
  destination.port = restartedPort;
  process.env.DATABASE_URL = destination.toString();
  db = database();
  assert.equal(await db.outbox.count(), 3);
  report.cases.postgresRestartPreservesQueue = true;
  const code = `const {database}=await import('./apps/api/dist/database.js');const {PrismaOutboxRepository}=await import('./apps/api/dist/modules/m1/infrastructure/repositories/prisma-outbox-repository.js');const {SmtpOutboxMailer}=await import('./apps/api/dist/modules/m1/infrastructure/adapters/smtp-outbox-mailer.js');const {DeliverOutbox}=await import('./apps/api/dist/modules/m1/application/use-cases/deliver-outbox.js');const db=database(),mail=new SmtpOutboxMailer();try{await new DeliverOutbox(new PrismaOutboxRepository(db),mail,()=>new Date(process.env.RECOVERY_CLOCK)).execute();}finally{mail.close();await db.$disconnect();}`;
  const deliver = (now) =>
    execFileSync(process.execPath, ['--input-type=module', '-e', code], {
      env: { ...process.env, RECOVERY_CLOCK: now.toISOString() },
      timeout: 20000,
      stdio: 'pipe',
    });
  docker(['stop', '--time', '10', stack.names.inbucket]);
  stopped = true;
  deliver(clock);
  for (const item of jobs.slice(0, 2))
    assert.equal((await db.outbox.findUniqueOrThrow({ where: { id: item.id } })).state, 'pending');
  assert.equal((await db.outbox.findUniqueOrThrow({ where: { id: jobs[2].id } })).state, 'failed');
  report.cases.smtpDownPreservesJobsAndExpiredFails = true;
  docker(['start', stack.names.inbucket]);
  stopped = false;
  let captureReady = false;
  for (let i = 0; i < 100; i++) {
    try {
      await captured('http://127.0.0.1:54424');
      captureReady = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  assert.ok(captureReady);
  deliver(new Date(+clock + 300001));
  assert.equal((await captured('http://127.0.0.1:54424')).length, 2);
  for (const item of jobs.slice(0, 2))
    assert.equal((await db.outbox.findUniqueOrThrow({ where: { id: item.id } })).state, 'sent');
  report.cases.newWorkerProcessDeliversRestoredJobs = true;
  deliver(new Date(+clock + 300002));
  assert.equal((await captured('http://127.0.0.1:54424')).length, 2);
  assert.equal((await captured('http://127.0.0.1:54324')).length, 0);
  assert.deepEqual(await business(db), snapshot);
  report.cases.noRepeatedBusinessOrOriginMail = true;
  report.jobs = 3;
  report.durationMs = Date.now() - started;
  report.result = 'PASS';
  console.log(
    '113-F: restauración/reinicio PG, nuevos procesos, caída SMTP y entrega aislada pasaron',
  );
} catch (error) {
  report.result = 'FAIL';
  report.error =
    error instanceof assert.AssertionError ? error.message : 'Fallo de ensayo; detalle privado';
  writeFileSync(folder + '/failure.private.log', String(error.stack), { mode: 0o600 });
  process.exitCode = 1;
} finally {
  if (stopped) docker(['start', stack.names.inbucket]);
  await seed?.$disconnect();
  await db?.$disconnect();
  if (created) docker(['stop', '--time', '10', name]);
  report.cleanup =
    'Contenedor propio --rm detenido; dump privado conservado; capturador destino activo';
  writeFileSync(
    'tests/results/recovery-outbox' + (report.result === 'FAIL' ? '-failure' : '') + '.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
