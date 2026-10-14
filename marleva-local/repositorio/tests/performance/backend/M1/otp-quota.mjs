import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { database } from '../../../../apps/api/dist/database.js';
import { AccountService } from '../../../../apps/api/dist/account.service.js';
process.loadEnvFile(new URL('../../../../.env', import.meta.url));
assert.equal(process.env.MARLEVA_QUOTA_CHECK, '1', 'Requiere ensayo local separado');
assert.equal(process.env.APP_MODE, 'local');
assert.equal(new URL(process.env.SUPABASE_URL).hostname, '127.0.0.1');
const db = database(),
  service = new AccountService(db),
  origin = 'quota-pf-' + randomUUID();
const ids = [],
  groups = [];
let sequence = 0;
try {
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const id = randomUUID();
    ids.push(id);
    await db.challenge.create({
      data: {
        id,
        origin,
        email: `${origin}-${i}@example.test`,
        state: 'superseded',
        createdAt: new Date(now),
        expiresAt: new Date(now + 600000),
      },
    });
  }
  for (const concurrency of [1, 5, 10]) {
    const samples = [];
    let errors = 0,
      peakRss = process.memoryUsage().rss;
    async function phase(duration, record) {
      const end = performance.now() + duration;
      await Promise.all(
        Array.from({ length: concurrency }, async () => {
          while (performance.now() < end) {
            const start = performance.now();
            let correct = false;
            try {
              await service.challenge(`${origin}-attempt-${++sequence}@example.test`, origin);
            } catch (error) {
              correct =
                error.getStatus?.() === 429 && error.retryAfter > 3500 && error.retryAfter <= 3600;
            }
            if (record) {
              if (correct) samples.push(performance.now() - start);
              else errors++;
            }
            peakRss = Math.max(peakRss, process.memoryUsage().rss);
          }
        }),
      );
    }
    await phase(1000, false);
    const cpu = process.cpuUsage(),
      start = performance.now();
    await phase(5000, true);
    const elapsed = performance.now() - start,
      usage = process.cpuUsage(cpu);
    samples.sort((a, b) => a - b);
    const q = (p) => samples[Math.min(samples.length - 1, Math.floor(samples.length * p))] ?? null;
    groups.push({
      concurrency,
      warmup_ms: 1000,
      measurement_ms: elapsed,
      expected_429: samples.length,
      unexpected: errors,
      p50_ms: q(0.5),
      p95_ms: q(0.95),
      p99_ms: q(0.99),
      attempts_per_second: samples.length / (elapsed / 1000),
      cpu_client_us: usage,
      peak_client_rss_bytes: peakRss,
    });
  }
  const finalRows = await db.challenge.count({ where: { origin } });
  await writeFile(
    new URL('../../../results/otp-quota-performance.json', import.meta.url),
    JSON.stringify(
      {
        id: 'MAR-M1-PF-BE-101-A',
        date: new Date().toISOString(),
        node: process.version,
        scope:
          'AccountService + PG local; rama429 por cuota, sin HTTP/envío OTP/capacidad productiva',
        dataset: '30 reservas ficticias; origen exclusivo; sin desactivar cuotas',
        groups,
        finalRows,
      },
      null,
      2,
    ) + '\n',
  );
  assert.equal(finalRows, 30);
  assert.ok(groups.every((g) => g.expected_429 > 0 && g.unexpected === 0));
  console.log('Cuota OTP: tres concurrencias; rechazos esperados y30 reservas conservadas');
} finally {
  await db.challenge.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
}
