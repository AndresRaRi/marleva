import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { recoveryContext } from '../../../fixtures/recovery-context.mjs';
const active = JSON.parse(readFileSync('artifacts/recovery/active-run-006.json', 'utf8'));
Object.assign(process.env, {
  MARLEVA_RECOVERY_RUN: active.run,
  MARLEVA_RECOVERY_CHECK: '1',
  MARLEVA_STACK_CONTEXT: 'b12-source-006',
});
const context = recoveryContext();
function run(script) {
  const result = spawnSync('./scripts/tool', ['node', script], {
    env: process.env,
    encoding: 'utf8',
    timeout: 300000,
  });
  writeFileSync(
    context.folder + '/' + script.split('/').at(-1) + '.private.log',
    result.stdout + result.stderr,
    { mode: 0o600 },
  );
  assert.equal(result.status, 0, 'Etapa falló: ' + script + '; detalle privado');
}
async function sourceApi(task) {
  let occupied = false;
  try {
    occupied = (
      await fetch(context.sourceApi + '/health/live', { signal: AbortSignal.timeout(1000) })
    ).ok;
  } catch {
    /* Expected before starting an owned source process. */
  }
  assert.equal(occupied, false, 'Puerto del ensayo ocupado; no adjuntar otro proceso');

  const log = openSync(context.folder + '/source-api.private.log', 'a', 0o600);
  const child = spawn('./scripts/tool', ['node', 'tests/fixtures/recovery-source-api.mjs'], {
    env: process.env,
    stdio: ['ignore', log, log],
  });
  closeSync(log);
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try {
        ready = (await fetch(context.sourceApi + '/health/ready')).status === 200;
      } catch {
        /* Bounded startup of this owned child only. */
      }
      if (ready) break;
      assert.equal(child.exitCode, null, 'API de ensayo terminó antes de estar lista');
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    assert.ok(ready, 'API aislada no quedó lista');
    await task();
  } finally {
    child.kill('SIGTERM');
    let deadline;
    try {
      await Promise.race([
        new Promise((resolve) => child.once('exit', resolve)),
        new Promise((_, reject) => {
          deadline = setTimeout(() => reject(Error('API propia no cerró')), 15000);
        }),
      ]);
    } finally {
      clearTimeout(deadline);
    }
  }
}
const stage = process.argv[2];
if (stage === 'source')
  await sourceApi(() => run('tests/integration/backend/M1/recovery-source.mjs'));
else if (stage === 'prepare') run('tests/fixtures/recovery-prepare.mjs');
else if (stage === 'copy') {
  await sourceApi(() => run('tests/integration/backend/M1/recovery-source.mjs'));
  run('tests/integration/backend/M1/recovery-copy.mjs');
  await sourceApi(() => run('tests/integration/backend/M1/recovery-after-copy.mjs'));
  run('tests/fixtures/recovery-keys.mjs');
  run('tests/fixtures/recovery-stack.mjs');
  await sourceApi(() => run('tests/integration/backend/M1/recovery-provider.mjs'));
} else if (stage === 'outbox') run('tests/integration/backend/M1/recovery-integral-outbox.mjs');
else if (stage === 'operator') run('tests/integration/backend/M1/recovery-api.mjs');
else throw new Error('Etapa de ensayo desconocida');
console.log('B12 integral: etapa ' + stage + ' comprobada en ejecución ' + active.run);
