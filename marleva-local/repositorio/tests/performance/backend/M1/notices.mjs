import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import os from 'node:os';
import { PrismaNoticeRepository } from '../../../../apps/api/dist/modules/m1/infrastructure/repositories/prisma-notice-repository.js';
import { ListNotices } from '../../../../apps/api/dist/modules/m1/application/use-cases/list-notices.js';
import { database } from '../../../../apps/api/dist/database.js';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
process.chdir(root);
if (process.env.MARLEVA_PERFORMANCE_LOCAL !== '1')
  throw new Error('Explicit local performance gate required');
process.loadEnvFile('.env');
const pg = createRequire(new URL('../../../../apps/api/package.json', import.meta.url))('pg');
const name = 'marleva-notices-pf-' + Date.now();
const image =
  'public.ecr.aws/supabase/postgres@sha256:06ddc7962e11ab0f4f0334fd05671e97c30ea202f6e6a7113800bd3d6e416108';
function docker(args) {
  const r = spawnSync(root + 'scripts/tool', ['docker', ...args], {
    encoding: 'utf8',
    timeout: 30000,
  });
  if (r.status !== 0)
    throw new Error('Local Docker operation failed: ' + args.slice(0, 2).join(' '));
  return r.stdout.trim();
}
let created = false,
  pool,
  db;
const report = {
  id: 'MAR-M1-PF-BE-108',
  chat: 'MAR-CHAT-005',
  date: new Date().toISOString(),
  sequence: 'MAR-M1-SEQ-008:S080',
  scope:
    'Real Prisma repository/PG17 in disposable destination; no HTTP/Auth/SMTP/frontend capacity claim',
  image,
  hardware: { platform: os.platform(), arch: os.arch(), memoryBytes: os.totalmem() },
  versions: { node: process.version, prisma: '7.10.0' },
  groups: [],
  resources: [],
  expected:
    'No incorrect/foreign pages or unexpected errors; proposed local p95<=500ms at concurrency5, not pilot commitment',
};
try {
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
    image,
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
  if (!ready) throw new Error('Isolated PostgreSQL unavailable');
  report.postgres = (await pool.query('SHOW server_version')).rows[0].server_version;
  await pool.query(
    'CREATE SCHEMA marleva; CREATE ROLE marleva_api; CREATE TABLE marleva._prisma_migrations(id text);',
  );
  await pool.query(
    readFileSync('apps/api/prisma/migrations/202610120002_m1_tables/migration.sql', 'utf8'),
  );
  await pool.query(
    readFileSync('apps/api/prisma/migrations/202610130001_notice_cursor/migration.sql', 'utf8'),
  );
  const accounts = [];
  for (let i = 0; i < 100; i++) {
    const id = randomUUID(),
      size = [10, 50, 1000][i % 3];
    accounts.push({ id, size });
    await pool.query('INSERT INTO marleva."Account"(id,"authId",email) VALUES ($1,$1,$2)', [
      id,
      `performance-${i}@example.test`,
    ]);
    await pool.query(
      `INSERT INTO marleva."Notice"("accountId",kind,text,"createdAt") SELECT $1,'fixture','ficticio','2026-10-13T10:00:00Z'::timestamptz+g*interval '1 microsecond' FROM generate_series(1,$2) g`,
      [id, size],
    );
  }
  await pool.query('ANALYZE marleva."Notice";');
  report.dataset = {
    accounts: 100,
    sizes: [10, 50, 1000],
    rows: accounts.reduce((n, a) => n + a.size, 0),
    isolated: true,
  };
  db = database();
  const useCase = new ListNotices(new PrismaNoticeRepository(db));
  for (const concurrency of [1, 5, 10]) {
    const samples = new Map([10, 50, 1000].map((n) => [n, []]));
    let errors = 0,
      incorrect = 0,
      sequence = 0;
    const run = async (duration, measuring) => {
      const until = performance.now() + duration;
      await Promise.all(
        Array.from({ length: concurrency }, async () => {
          while (performance.now() < until) {
            const account = accounts[sequence++ % accounts.length],
              start = performance.now();
            try {
              const page = await useCase.execute(account.id, 24);
              if (
                page.items.length !== Math.min(24, account.size) ||
                page.items.some((n) => n.accountId !== account.id) ||
                account.size > 24 !== (page.next_cursor !== null)
              )
                incorrect++;
              if (measuring) samples.get(account.size).push(performance.now() - start);
            } catch {
              errors++;
            }
          }
        }),
      );
    };
    await run(10000, false);
    const started = performance.now();
    await run(60000, true);
    const durationMs = performance.now() - started;
    const groups = [...samples].map(([size, ms]) => {
      ms.sort((a, b) => a - b);
      const q = (p) => ms[Math.min(ms.length - 1, Math.floor(ms.length * p))];
      return { size, requests: ms.length, p50: q(0.5), p95: q(0.95), p99: q(0.99) };
    });
    report.groups.push({
      concurrency,
      warmupMs: 10000,
      durationMs,
      datasets: groups,
      unexpectedErrors: errors,
      incorrect,
      requestsPerSecond: groups.reduce((n, g) => n + g.requests, 0) / (durationMs / 1000),
    });
    report.resources.push({
      concurrency,
      container: docker(['stats', '--no-stream', '--format', '{{json .}}', name]),
      nodeRss: process.memoryUsage().rss,
      connections: Number(
        (await pool.query('SELECT count(*) FROM pg_stat_activity')).rows[0].count,
      ),
    });
    console.log(
      `Concurrency ${concurrency} completed; ${errors} errors, ${incorrect} incorrect pages`,
    );
  }
  report.passed =
    report.groups.every((g) => g.unexpectedErrors === 0 && g.incorrect === 0) &&
    report.groups.find((g) => g.concurrency === 5).datasets.every((d) => d.p95 <= 500);
} catch (e) {
  report.passed = false;
  report.failure = e.message;
  process.exitCode = 1;
} finally {
  await db?.$disconnect();
  await pool?.end();
  if (created) docker(['rm', '-f', name]);
  report.cleaned = created;
  report.finishedAt = new Date().toISOString();
  writeFileSync('tests/results/notices-performance.json', JSON.stringify(report, null, 2) + '\n');
}
