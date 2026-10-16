import assert from 'node:assert/strict';
import { assertCiTarget } from '../../../fixtures/live-browser-guard.mjs';
import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { database } from '../../../../apps/api/dist/database.js';
import { AccountService } from '../../../../apps/api/dist/account.service.js';
import { capturedCode } from '../../../integration/frontend/M1/live-otp.mjs';
assertCiTarget(process.env);
const db = database(),
  service = new AccountService(db);
const prefix = 'pf-' + randomUUID(),
  accounts = [];
const report = {
  id: 'MAR-M1-PF-BE-103/108',
  date: new Date().toISOString(),
  runtime: {
    node: process.version,
    platform: os.platform(),
    arch: os.arch(),
    memoryBytes: os.totalmem(),
    cpus: os.cpus().length,
  },
  postgresImage: process.env.MARLEVA_CI_POSTGRES_IMAGE,
  prisma: '7.10.0',
  scope:
    'HTTP API/PG/Auth reales aislados; sesiones preparadas por OTP. No capacidad productiva, emuladores o SLO.',
  dataset: { accounts: 100, noticeSizes: [10, 50, 1000] },
  groups: [],
  engineeringTargets: {
    p95AtConcurrency5Ms: 500,
    unexpectedErrorsPercent: 1,
    status: 'Objetivos propuestos, no compromisos de piloto',
  },
};
function quantiles(values) {
  values.sort((a, b) => a - b);
  const q = (p) => values[Math.min(values.length - 1, Math.floor(values.length * p))] ?? null;
  return { requests: values.length, p50: q(0.5), p95: q(0.95), p99: q(0.99) };
}
try {
  report.postgres = (await db.$queryRaw`SHOW server_version`)[0].server_version;
  for (let i = 0; i < 100; i++) {
    const address = prefix + '-' + i + '@example.test';
    const c = await service.challenge(address, prefix + '-' + i);
    const a = await service.verify(c.challenge_id, await capturedCode(address, new Set()));
    const size = [10, 50, 1000][i % 3];
    await db.$executeRaw`INSERT INTO marleva."Notice"("accountId",kind,text) SELECT ${a.account.id}::uuid,'performance.fixture',${prefix} FROM generate_series(1,${size}::integer)`;
    accounts.push({ token: a.token, id: a.account.id, size });
  }
  for (const concurrency of [1, 5, 10]) {
    const samples = { me: [], notices: [] };
    let errors = 0,
      incorrect = 0,
      sequence = 0,
      measuredRequests = 0;
    async function load(milliseconds, measuring) {
      const until = performance.now() + milliseconds;
      await Promise.all(
        Array.from({ length: concurrency }, async () => {
          while (performance.now() < until) {
            const index = sequence++,
              a = accounts[Math.floor(index / 2) % accounts.length];
            const kind = index % 2 ? 'notices' : 'me';
            const started = performance.now();
            try {
              const r = await fetch(
                'http://127.0.0.1:3000/v1/' + (kind === 'me' ? 'me' : 'notifications'),
                {
                  headers: { authorization: 'Bearer ' + a.token, 'x-marleva-client': 'native' },
                  signal: AbortSignal.timeout(10000),
                },
              );
              const body = await r.json();
              if (r.status !== 200) errors++;
              else if (
                kind === 'me'
                  ? body.id !== a.id
                  : body.items.length !== Math.min(a.size, 24) ||
                    body.items.some((item) => item.accountId !== a.id) ||
                    (body.next_cursor !== null) !== a.size > 24
              )
                incorrect++;
            } catch {
              errors++;
            }
            if (measuring) {
              samples[kind].push(performance.now() - started);
              measuredRequests++;
            }
          }
        }),
      );
    }
    await load(10000, false);
    const started = performance.now();
    await load(60000, true);
    const durationMs = performance.now() - started;
    const pg =
      await db.$queryRaw`SELECT count(*)::integer AS count FROM pg_stat_activity WHERE datname=current_database()`;
    report.groups.push({
      concurrency,
      warmupMs: 10000,
      durationMs,
      me: quantiles(samples.me),
      notices: quantiles(samples.notices),
      unexpectedErrors: errors,
      incorrect,
      requestsPerSecond: measuredRequests / (durationMs / 1000),
      nodeRss: process.memoryUsage().rss,
      cpuUsage: process.cpuUsage(),
      pgConnections: pg[0].count,
      postgresResources: JSON.parse(
        execFileSync(
          'docker',
          ['stats', '--no-stream', '--format', '{{json .}}', 'supabase_db_marleva-ci'],
          { encoding: 'utf8', timeout: 10000 },
        ),
      ),
    });
    console.log(
      'M1 HTTP concurrencia ' +
        concurrency +
        ': ' +
        errors +
        ' errores, ' +
        incorrect +
        ' respuestas incorrectas',
    );
  }
  report.correct = report.groups.every(
    (g) =>
      g.unexpectedErrors === 0 && g.incorrect === 0 && g.me.requests > 0 && g.notices.requests > 0,
  );
  const five = report.groups.find((g) => g.concurrency === 5);
  report.engineeringTargetsMet = five.me.p95 <= 500 && five.notices.p95 <= 500;
  assert.ok(report.correct, 'Respuestas incorrectas o errores inesperados en carga M1');
} finally {
  await db.$disconnect();
  report.finishedAt = new Date().toISOString();
  writeFileSync('tests/results/account-performance.json', JSON.stringify(report, null, 2) + '\n');
}
