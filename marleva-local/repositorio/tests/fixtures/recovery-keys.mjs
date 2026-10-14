import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID, createHmac } from 'node:crypto';
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const folder = 'artifacts/recovery/target-keys';
mkdirSync(folder, { recursive: true, mode: 0o700 });
chmodSync(folder, 0o700);
// Use Supabase's generator for the disposable provider's signing key.
// No user tokens are issued by this fixture; Auth continues to issue them.
let generated;
try {
  generated = execFileSync(
    './scripts/tool',
    ['supabase', 'gen', 'signing-key', '--algorithm', 'ES256', '--workdir', folder],
    { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'pipe'] },
  );
} catch {
  throw new Error('No se pudo generar clave privada del proveedor desechable');
}
writeFileSync(folder + '/generated.private.json', generated, { mode: 0o600 });
const ec = JSON.parse(generated);
assert.equal(ec.kty, 'EC');
assert.equal(ec.crv, 'P-256');
assert.ok(ec.d && ec.x && ec.y);
ec.alg = 'ES256';
ec.use = 'sig';
ec.kid ??= randomUUID();
const jwtSecret = randomBytes(32).toString('hex'),
  symmetricKid = randomUUID();
const symmetric = {
  kty: 'oct',
  alg: 'HS256',
  kid: symmetricKid,
  use: 'sig',
  k: Buffer.from(jwtSecret).toString('base64url'),
};
const { d: privatePart, ...publicEc } = ec;
assert.ok(privatePart);
publicEc.key_ops = ['verify'];
function apiKey(role) {
  assert.ok(['anon', 'service_role'].includes(role));
  const now = Math.floor(Date.now() / 1000);
  const head = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: symmetricKid }),
  ).toString('base64url');
  const claims = Buffer.from(
    JSON.stringify({ iss: 'supabase', aud: 'authenticated', role, iat: now, exp: now + 86400 }),
  ).toString('base64url');
  const content = head + '.' + claims;
  return content + '.' + createHmac('sha256', jwtSecret).update(content).digest('base64url');
}
writeFileSync(
  folder + '/keys.private.json',
  JSON.stringify(
    {
      jwtSecret,
      authKeys: [ec, symmetric],
      jwks: { keys: [publicEc, symmetric] },
      anon: apiKey('anon'),
      service: apiKey('service_role'),
    },
    null,
    2,
  ),
  { mode: 0o600 },
);
console.log('B12: claves ES256/HS256 y API distintas guardadas solo en almacenamiento privado');
