import { recoveryContext } from '../../../fixtures/recovery-context.mjs';
const context = recoveryContext();
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { database } from '../../../../apps/api/dist/database.js';
process.loadEnvFile(context.envFile ?? new URL('../../../../.env', import.meta.url));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
assert.equal(process.env.APP_MODE, 'local');
const copy = JSON.parse(readFileSync(context.report('copy'), 'utf8'));
assert.equal(copy.cases.storageHashes, true);
const fixture = JSON.parse(readFileSync(context.fixture, 'utf8'));
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
  writeFileSync(context.ledger, JSON.stringify([ledger], null, 2), {
    mode: 0o600,
  });
try {
  save();
  const response = await fetch(context.sourceApi + '/v1/local/file-fixtures/' + file.id, {
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
    context.report('after-copy'),
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
