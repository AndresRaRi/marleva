import { recoveryContext } from '../../../fixtures/recovery-context.mjs';
const context = recoveryContext();
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const fixture = JSON.parse(readFileSync(context.fixture, 'utf8'));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const base = context.sourceApi + '/v1/local/file-fixtures';
const report = {
  date: new Date().toISOString(),
  case: 'MAR-M1-IT-BE-113-B-PRE',
  own: 0,
  otherDenied: 0,
  publicDenied: 0,
};
for (const file of fixture.files) {
  const own = fixture.actors.find((a) => a.name === file.owner),
    other = fixture.actors.find((a) => a.name !== file.owner);
  const issued = await fetch(`${base}/${file.id}/access`, {
    method: 'POST',
    headers: { authorization: 'Bearer ' + own.credential, 'x-marleva-client': 'native' },
  });
  if (issued.status !== 201) {
    const failure = await issued.json();
    assert.fail('Permiso de archivo: HTTP ' + issued.status + ', código ' + failure.codigo);
  }
  const access = await issued.json();
  const read = await fetch(`${base}/${file.id}/content`, {
    headers: {
      authorization: 'Bearer ' + own.credential,
      'x-fixture-capability': access.capability,
    },
  });
  assert.equal(read.status, 200);
  const data = Buffer.from(await read.arrayBuffer());
  assert.equal(data.length, file.bytes);
  assert.equal(createHash('sha256').update(data).digest('hex'), file.sha256);
  report.own++;
  const denied = await fetch(`${base}/${file.id}/content`, {
    headers: {
      authorization: 'Bearer ' + other.credential,
      'x-fixture-capability': access.capability,
    },
  });
  assert.equal(denied.status, 404);
  report.otherDenied++;
  const publicRead = await fetch(`${base}/${file.id}/content`);
  assert.equal(publicRead.status, 401);
  report.publicDenied++;
  file.capability = access.capability;
}
writeFileSync(context.fixture, JSON.stringify(fixture, null, 2), {
  mode: 0o600,
});
writeFileSync(context.report('source'), JSON.stringify(report, null, 2) + '\n');
console.log(
  'B12: tres contenidos propios/hash válidos; otra cuenta y público denegados antes de copia',
);
