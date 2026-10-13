import { beforeAll, afterAll, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { database } from '../../../../apps/api/dist/database.js';
import { PrismaOutboxRepository } from '../../../../apps/api/dist/modules/m1/infrastructure/repositories/prisma-outbox-repository.js';
import { SmtpOutboxMailer } from '../../../../apps/api/dist/modules/m1/infrastructure/adapters/smtp-outbox-mailer.js';
import { DeliverOutbox } from '../../../../apps/api/dist/modules/m1/application/use-cases/deliver-outbox.js';
import { startWorker } from '../../../../apps/api/dist/worker.js';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
process.loadEnvFile(root + '.env');
const pg = createRequire(new URL('../../../../apps/api/package.json', import.meta.url))('pg');
const name = 'marleva-outbox-it-' + Date.now();
let created = false,
  pool,
  db,
  repo,
  mailer;
const clock = new Date('2030-01-01T00:00:00Z');
function docker(args) {
  const r = spawnSync(root + 'scripts/tool', ['docker', ...args], {
    encoding: 'utf8',
    timeout: 30000,
  });
  if (r.status !== 0) throw new Error('Local Docker failure: ' + args.slice(0, 2).join(' '));
  return r.stdout.trim();
}
beforeAll(async () => {
  if (process.env.MARLEVA_OUTBOX_CHECK !== '1') throw Error('Requires explicit local outbox gate');
  docker([
    'run',
    '--pull=never',
    '--rm',
    '-d',
    '--name',
    name,
    '--memory',
    '768m',
    '-p',
    '127.0.0.1::5432',
    '-e',
    'POSTGRES_PASSWORD=fixture-only',
    '--entrypoint',
    'docker-entrypoint.sh',
    'public.ecr.aws/supabase/postgres@sha256:06ddc7962e11ab0f4f0334fd05671e97c30ea202f6e6a7113800bd3d6e416108',
    'postgres',
    '-c',
    'listen_addresses=0.0.0.0',
  ]);
  created = true;
  const port = docker(['port', name, '5432/tcp']).split(':').at(-1);
  process.env.DATABASE_URL = `postgresql://postgres:fixture-only@127.0.0.1:${port}/postgres`;
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 1000,
  });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      await pool.query('SELECT 1');
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  if (!ready) throw Error('Isolated PG unavailable');
  await pool.query(
    'CREATE SCHEMA marleva; CREATE ROLE marleva_api; CREATE TABLE marleva._prisma_migrations(id text);',
  );
  await pool.query(
    readFileSync(root + 'apps/api/prisma/migrations/202610120002_m1_tables/migration.sql', 'utf8'),
  );
  db = database();
  repo = new PrismaOutboxRepository(db);
  mailer = new SmtpOutboxMailer();
}, 60000);
afterAll(async () => {
  mailer?.close();
  await db?.$disconnect();
  await pool?.end();
  if (created) docker(['rm', '-f', name]);
});
async function fixture(createdAt = clock) {
  return db.outbox.create({
    data: {
      reference: randomUUID(),
      recipient: 'outbox@example.test',
      subject: 'Outbox fixture ' + randomUUID(),
      text: 'Solo datos ficticios',
      createdAt,
      dueAt: createdAt,
    },
  });
}
async function captured(subject) {
  const data = await (await fetch(process.env.MAILPIT_URL + '/api/v1/messages')).json();
  return data.messages.filter((m) => m.Subject === subject).length;
}

it('MAR-M1-IT-BE-108-B | SEQ008:S050 | SMTP real caído conserva tarea y reinicio entrega', async () => {
  const item = await fixture();
  docker(['stop', 'supabase_inbucket_marleva-m1']);
  try {
    await new DeliverOutbox(repo, mailer, () => clock).execute();
    const row = await db.outbox.findUniqueOrThrow({ where: { id: item.id } });
    expect(row.state).toBe('pending');
    expect(row.attempts).toBe(1);
    expect(+row.dueAt - +clock).toBe(60000);
  } finally {
    docker(['start', 'supabase_inbucket_marleva-m1']);
  }
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(process.env.MAILPIT_URL + '/api/v1/info')).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for actual SMTP capture readiness. */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  expect(ready).toBe(true);
  await new DeliverOutbox(repo, mailer, () => new Date(+clock + 60000)).execute();
  expect((await db.outbox.findUniqueOrThrow({ where: { id: item.id } })).state).toBe('sent');
  expect(await captured(item.subject)).toBe(1);
}, 30000);
it('MAR-M1-IT-BE-108-C | SEQ008:S030/S060 | dos workers y trabajador viejo no pisan lease nueva', async () => {
  const item = await fixture();
  const lease1 = new Date(+clock + 15000),
    lease2 = new Date(+clock + 31000);
  expect(await repo.claim(item, clock, lease1)).toBe(true);
  const fresh = await db.outbox.findUniqueOrThrow({ where: { id: item.id } });
  expect(await repo.claim(fresh, new Date(+clock + 16000), lease2)).toBe(true);
  await repo.complete(item.id, lease1);
  await repo.retry(item.id, lease1, new Date(+clock + 60000), false);
  expect((await db.outbox.findUniqueOrThrow({ where: { id: item.id } })).leaseUntil).toEqual(
    lease2,
  );
  await repo.complete(item.id, lease2);
  const concurrent = await fixture();
  await Promise.all([
    new DeliverOutbox(repo, mailer, () => clock).execute(),
    new DeliverOutbox(repo, mailer, () => clock).execute(),
  ]);
  expect((await db.outbox.findUniqueOrThrow({ where: { id: concurrent.id } })).attempts).toBe(1);
  expect(await captured(concurrent.subject)).toBe(1);
});
it('MAR-M1-IT-BE-108-D | SEQ008:S055 | caída después SMTP antesack puede repetir correo sin repetir negocio', async () => {
  const item = await fixture();
  const interrupted = {
    ready: (n) => repo.ready(n),
    expire: (...a) => repo.expire(...a),
    claim: (...a) => repo.claim(...a),
    complete: async () => {
      throw Error('Injected interruption after actual SMTP acceptance');
    },
    retry: async () => {
      throw Error('Injected process termination before persistence');
    },
  };
  await expect(new DeliverOutbox(interrupted, mailer, () => clock).execute()).rejects.toThrow();
  expect(await captured(item.subject)).toBe(1);
  expect((await db.outbox.findUniqueOrThrow({ where: { id: item.id } })).state).toBe('sending');
  await new DeliverOutbox(repo, mailer, () => new Date(+clock + 16000)).execute();
  expect((await db.outbox.findUniqueOrThrow({ where: { id: item.id } })).state).toBe('sent');
  expect(await db.outbox.count({ where: { reference: item.reference } })).toBe(1);
  // Mailpit may deduplicate stable Message-ID. Do not claim SMTP exactly-once.
  expect(await captured(item.subject)).toBeGreaterThanOrEqual(1);
});
it('MAR-M1-IT-BE-108-E | SEQ008:S035/S100 | caducidad sin envío y arranque real worker aislado', async () => {
  const expired = await fixture(new Date(+clock - 86400000));
  await new DeliverOutbox(repo, mailer, () => clock).execute();
  expect((await db.outbox.findUniqueOrThrow({ where: { id: expired.id } })).state).toBe('failed');
  expect(await captured(expired.subject)).toBe(0);
  const item = await fixture(new Date());
  const stop = startWorker(db, { reconcile: async () => {} });
  try {
    let delivered = false;
    for (let i = 0; i < 100; i++) {
      if ((await db.outbox.findUniqueOrThrow({ where: { id: item.id } })).state === 'sent') {
        delivered = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(delivered).toBe(true);
    expect(await captured(item.subject)).toBe(1);
  } finally {
    stop();
  }
});

it('MAR-M1-PF-BE-108-W | SEQ008:S030-S060 | entrega proporcional SMTP/PG reales, dos workers', async () => {
  const warmup = await fixture();
  await new DeliverOutbox(repo, mailer, () => clock).execute();
  expect((await db.outbox.findUniqueOrThrow({ where: { id: warmup.id } })).state).toBe('sent');
  const items = [];
  for (let i = 0; i < 30; i++) items.push(await fixture());
  const started = performance.now(),
    batches = [];
  while (
    await db.outbox.count({ where: { id: { in: items.map((x) => x.id) }, state: 'pending' } })
  ) {
    const before = performance.now();
    await Promise.all([
      new DeliverOutbox(repo, mailer, () => clock).execute(),
      new DeliverOutbox(repo, mailer, () => clock).execute(),
    ]);
    batches.push(performance.now() - before);
    if (batches.length > 10) throw Error('Unexpected incomplete outbox workload');
  }
  const durationMs = performance.now() - started;
  const rows = await db.outbox.findMany({ where: { id: { in: items.map((x) => x.id) } } });
  const correct = rows.length === 30 && rows.every((x) => x.state === 'sent' && x.attempts === 1);
  const report = {
    id: 'MAR-M1-PF-BE-108-W',
    date: new Date().toISOString(),
    scope:
      'Disposable PG17 + actual SMTP capture; one-message warmup,30fictitious jobs,two concurrent workers; no HTTP/production capacity claim',
    versions: { node: process.version, postgres: '17.11', nodemailer: '10.1.0' },
    jobs: 30,
    concurrency: 2,
    durationMs,
    jobsPerSecond: 30000 / durationMs,
    batchesMs: batches,
    nodeRss: process.memoryUsage().rss,
    correct,
    threshold: 'Proportional smoke measurement; no approved production latency threshold',
    cleanup: 'afterAll removes only identified disposable PostgreSQL container',
  };
  writeFileSync(
    root + 'tests/results/notices-worker-performance.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  expect(correct).toBe(true);
}, 30000);
