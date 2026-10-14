import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const fixture = JSON.parse(readFileSync('artifacts/recovery/fixtures.private.json', 'utf8'));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const base = 'http://127.0.0.1:3000/v1/local/file-fixtures';
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
  assert.equal(issued.status, 201);
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
writeFileSync('artifacts/recovery/fixtures.private.json', JSON.stringify(fixture, null, 2), {
  mode: 0o600,
});
writeFileSync('tests/results/recovery-source.json', JSON.stringify(report, null, 2) + '\n');
console.log(
  'B12: tres contenidos propios/hash válidos; otra cuenta y público denegados antes de copia',
);
