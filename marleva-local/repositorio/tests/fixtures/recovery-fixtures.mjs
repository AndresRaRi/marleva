import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { database } from '../../apps/api/dist/database.js';
import { identityAdmin, identity, tokens } from '../../apps/api/dist/identity.js';
import { secret, seal, digest } from '../../apps/api/dist/security.js';
process.loadEnvFile(new URL('../../.env', import.meta.url));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
assert.equal(process.env.APP_MODE, 'local');
assert.equal(new URL(process.env.SUPABASE_URL).hostname, '127.0.0.1');
if (existsSync('artifacts/recovery/fixtures.private.json')) {
  assert.equal(
    JSON.parse(readFileSync('artifacts/recovery/fixtures.private.json', 'utf8')).state,
    'cleaned',
    'Dataset activo: continuar o limpiar sus IDs exactos antes de preparar otro',
  );
}
const db = database(),
  admin = identityAdmin(),
  prefix = 'b12-' + Date.now();
const fixture = {
  date: new Date().toISOString(),
  prefix,
  preparedIdentities: [],
  actors: [],
  files: [],
};
mkdirSync('artifacts/recovery', { recursive: true, mode: 0o700 });
const save = () =>
  writeFileSync('artifacts/recovery/fixtures.private.json', JSON.stringify(fixture, null, 2), {
    mode: 0o600,
  });
try {
  for (const name of ['A', 'B']) {
    const email = `${prefix}-${name.toLowerCase()}@example.test`;
    const link = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    assert.ok(
      !link.error && link.data.properties.hashed_token,
      'No se pudo preparar identidad ficticia',
    );
    fixture.preparedIdentities.push(link.data.user.id);
    save();
    const verified = await identity().auth.verifyOtp({
      type: link.data.properties.verification_type,
      token_hash: link.data.properties.hashed_token,
    });
    if (verified.error)
      console.log(
        'B12 fixture: verificación no disponible',
        verified.error.code,
        verified.error.status,
      );
    assert.ok(
      !verified.error && verified.data.session && verified.data.user,
      'Sesión ficticia del proveedor no disponible',
    );
    const account = await db.account.create({ data: { authId: verified.data.user.id, email } });
    const credential = secret();
    const provider = tokens(verified.data.session);
    const session = await db.session.create({
      data: {
        accountId: account.id,
        tokenHash: digest(credential),
        csrfHash: digest(secret()),
        providerTokens: seal(provider, process.env.TOKEN_ENCRYPTION_KEY),
      },
    });
    fixture.actors.push({
      name,
      accountId: account.id,
      authId: account.authId,
      sessionId: session.id,
      credential,
      provider,
    });
    save();
  }
  for (const [owner, purpose, bytes] of [
    ['A', 'keep', 1024],
    ['A', 'delete-after-copy', 1048576],
    ['B', 'keep', 1024],
  ]) {
    const actor = fixture.actors.find((a) => a.name === owner),
      id = randomUUID(),
      key = `${prefix}/${id}.txt`;
    const data = Buffer.alloc(bytes, owner === 'A' ? 65 : 66);
    const upload = await admin.storage
      .from('m1-private')
      .upload(key, data, { contentType: 'text/plain' });
    assert.ok(!upload.error, 'No se pudo preparar objeto ficticio');
    const sha256 = digest(data);
    await db.privateFixture.create({
      data: { id, accountId: actor.accountId, objectKey: key, sha256, bytes },
    });
    fixture.files.push({ id, owner, purpose, key, sha256, bytes });
    save();
  }
  console.log(
    'B12: dos identidades/sesiones y tres objetos ficticios preparados; credenciales solo privadas',
  );
} finally {
  await db.$disconnect();
}
