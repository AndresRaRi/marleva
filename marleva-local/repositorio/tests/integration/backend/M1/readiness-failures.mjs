import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { assertCiTarget } from '../../../fixtures/live-browser-guard.mjs';
import { readinessServices, assertReadinessTarget } from '../../../fixtures/readiness-target.mjs';
import { readinessProbe } from '../../../../apps/api/readiness-probe.mjs';
process.loadEnvFile(process.env.MARLEVA_ENV_FILE ?? 'artifacts/ci/stack/.env');
assertCiTarget(process.env);
const folder = process.env.MARLEVA_CI_OWNER_WORKDIR ?? path.resolve('artifacts/ci/stack');
function docker(args) {
  const result = spawnSync('docker', args, { encoding: 'utf8', timeout: 60000 });
  assert.equal(result.status, 0, 'No se pudo controlar el servicio CI propio');
  return result.stdout;
}
// Validate every target before the first stop; never attach to the local user stack.
for (const service of readinessServices) {
  const row = JSON.parse(docker(['inspect', 'supabase_' + service + '_marleva-ci']))[0];
  assertReadinessTarget(row, service, folder);
}
const app = await readinessProbe(process.env.APP_ORIGIN);
const origin = await app.getUrl();
const report = { id: 'MAR-M1-IT-BE-110-DEPENDENCIES', date: new Date().toISOString(), cases: [] };
async function request(route) {
  const result = await fetch(origin + '/health/' + route, { signal: AbortSignal.timeout(12000) });
  return {
    status: result.status,
    body: await result.json(),
    noStore: result.headers.get('cache-control'),
  };
}
async function readyAgain() {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    try {
      if ((await request('ready')).status === 200) return;
    } catch {
      /* A stopped own dependency is expected; recovery is bounded below. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('El stack CI propio no recuperó salud');
}
try {
  await readyAgain();
  for (const service of readinessServices) {
    const name = 'supabase_' + service + '_marleva-ci';
    const started = performance.now();
    try {
      docker(['stop', '--time', '30', name]);
      assert.equal(JSON.parse(docker(['inspect', name]))[0].State.Running, false);
      assert.equal((await request('live')).status, 200);
      const failureStarted = performance.now();
      const result = await request('ready');
      const unavailableMs = performance.now() - failureStarted;
      assert.equal(result.status, 503);
      assert.equal(result.body.codigo, 'DEPENDENCIA');
      assert.ok(result.body.accion_recuperacion && result.body.request_id);
      assert.equal(result.noStore, 'no-store');
      assert.ok(unavailableMs < 12000);
      for (const key of ['DATABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'])
        assert.ok(!JSON.stringify(result.body).includes(process.env[key]));
      report.cases.push({ service, status: 503, live: 200, unavailableMs, recovered: false });
    } finally {
      docker(['start', name]);
      await readyAgain();
    }
    report.cases.at(-1).recovered = true;
    const auth = await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users?page=1&per_page=1', {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
      },
      signal: AbortSignal.timeout(3000),
    });
    await auth.body?.cancel();
    assert.equal(auth.status, 200, 'Auth debe consultar su DB después de ready');
    report.cases.at(-1).authDatabaseAfterRecovery = 200;
    report.cases.at(-1).durationMs = performance.now() - started;
  }
  report.passed = true;
} finally {
  await app.close();
  report.limits =
    'Solo salud HTTP con PG/Auth/Storage/correo CI reales, detenidos de uno en uno y reanudados; sin escrituras de negocio, borrados, plataformas móviles o SLO productivo.';
  writeFileSync('tests/results/readiness-failures.json', JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report));
