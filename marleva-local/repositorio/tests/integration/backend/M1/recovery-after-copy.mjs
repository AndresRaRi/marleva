import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { database } from '../../../../apps/api/dist/database.js';
process.loadEnvFile(new URL('../../../../.env', import.meta.url));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
assert.equal(process.env.APP_MODE, 'local');
const copy = JSON.parse(readFileSync('tests/results/recovery-copy.json', 'utf8'));
assert.equal(copy.cases.storageHashes, true);
const fixture = JSON.parse(readFileSync('artifacts/recovery/fixtures.private.json', 'utf8'));
const file = fixture.files.find((f) => f.purpose === 'delete-after-copy'),
  actor = fixture.actors.find((a) => a.name === file.owner);
const db = database(),
  key = 'b12-after-copy-' + file.id;
const ledger = {
  fixtureId: file.id,
  accountId: actor.accountId,
  objectKey: file.key,
  idempotencyKey: key,
  copyPrefix: copy.names.prefix,
  requestedAt: new Date().toISOString(),
  state: 'not_requested',
};
const save = () =>
  writeFileSync('artifacts/recovery/deletions.private.json', JSON.stringify([ledger], null, 2), {
    mode: 0o600,
  });
try {
  save();
  const response = await fetch('http://127.0.0.1:3000/v1/local/file-fixtures/' + file.id, {
    method: 'DELETE',
    headers: {
      authorization: 'Bearer ' + actor.credential,
      'x-marleva-client': 'native',
      'content-type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify({ expected_version: 1 }),
  });
  assert.ok([200, 202].includes(response.status), 'Borrado posterior no aceptado');
  ledger.state = 'delete_pending';
  save();
  let deleted = false;
  for (let i = 0; i < 60; i++) {
    const current = await db.privateFixture.findUniqueOrThrow({ where: { id: file.id } });
    if (current.state === 'deleted') {
      deleted = true;
      ledger.completedAt = current.deletedAt.toISOString();
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(deleted, 'Obligación no completada; conservar pendiente');
  ledger.state = 'deleted';
  save();
  writeFileSync(
    'tests/results/recovery-after-copy.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        case: 'MAR-M1-IT-BE-113-C-PRE',
        fixtureId: file.id,
        copyPrefix: copy.names.prefix,
        obtained: 'DELETE por API aceptado; worker confirmó deleted; ledger mínimo fuera de backup',
        limits: 'Reaplicación en destino todavía pendiente',
      },
      null,
      2,
    ) + '\n',
  );
  console.log('B12: borrado posterior completado en origen y registrado fuera de la copia');
} finally {
  await db.$disconnect();
}
