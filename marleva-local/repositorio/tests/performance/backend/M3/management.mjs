import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { connectM3 } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/prisma-sql.js';
import { createM3Management } from '../../../../apps/api/dist-m3/m3-management.js';
import { FixtureIdentity } from '../../../fixtures/m3-identity.mjs';
import { actor, seed, product, sellerId } from '../../../fixtures/m3-fixtures.mjs';
if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Solo ensayo aislado M3.');
const { client, sql } = connectM3(true),
  identity = new FixtureIdentity();
const token = identity.issue(actor),
  app = await createM3Management(sql, identity);
const report = {
  date: new Date().toISOString(),
  scope: 'HTTP Nest/PG local; identidad ficticia; no proveedor M1 ni capacidad productiva',
  plan: { warmup: 3, samples: 20, concurrency: 1, p95_ms: 500, unexpected_errors: 0 },
  cases: [],
};
await seed(sql, 0);
await app.listen(0, '127.0.0.1');
const base = await app.getUrl();
async function sample(name, work) {
  for (let i = 0; i < report.plan.warmup; i++) await work();
  const times = [];
  for (let i = 0; i < report.plan.samples; i++) {
    const start = performance.now();
    await work();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const p95 = times[Math.ceil(times.length * 0.95) - 1];
  report.cases.push({ name, p50_ms: times[9], p95_ms: p95, max_ms: times.at(-1), errors: 0 });
  assert.ok(p95 <= report.plan.p95_ms, name + ' excede objetivo local');
}
async function call(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    headers: { Authorization: 'Bearer ' + token, ...options.headers },
  });
  assert.equal(response.status, 200);
  return response.json();
}
try {
  await sample('create-draft', () =>
    call('/v1/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID() },
      body: JSON.stringify({ id: randomUUID(), seller_id: sellerId, data: product }),
    }),
  );
  await sample('own-list-24', () => call('/v1/offers?scope=own&limit=24'));
  report.passed = true;
} finally {
  await app.close();
  await client.$disconnect();
  await writeFile(
    'tests/results/m3-management-performance.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
