import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Solo destino M3 propio.');
function docker(args) {
  const result = spawnSync('./scripts/tool', ['docker', ...args], {
    encoding: 'utf8',
    timeout: 30000,
  });
  if (result.status !== 0) throw Error('Docker M3 falló');
  return result.stdout.trim();
}
assert.equal(
  docker(['inspect', '--format', '{{index .Config.Labels "mx.marleva.module"}}', 'marleva-m3-008']),
  'M3',
);
const url = 'http://127.0.0.1:3103/v1/catalog/offers?limit=1';
const before = await fetch(url);
assert.equal(before.status, 200);
const original = await before.json();
const report = {
  date: new Date().toISOString(),
  case: 'MAR-M3-IT-BE-010-RESTART',
  destination: 'marleva-m3-008',
  passed: false,
};
try {
  docker(['stop', '--time', '5', 'marleva-m3-008']);
  const outage = await fetch(url);
  assert.equal(outage.status, 503);
  const body = await outage.json();
  assert.equal(body.codigo, 'UNAVAILABLE');
  assert.equal('items' in body, false);
  report.outage_status = outage.status;
} finally {
  docker(['start', 'marleva-m3-008']);
}
for (let i = 0; i < 60; i++) {
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const current = await response.json();
      assert.equal(current.items[0].id, original.items[0].id);
      report.passed = true;
      break;
    }
  } catch (error) {
    report.last_retry_error = error instanceof Error ? error.name : 'Error';
  }
  await delay(250);
}
await writeFile('tests/results/m3-restart.json', JSON.stringify(report, null, 2) + '\n');
assert.equal(report.passed, true);
