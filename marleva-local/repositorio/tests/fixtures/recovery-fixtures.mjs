import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { database } from '../../apps/api/dist/database.js';
import { identityAdmin, identity, tokens } from '../../apps/api/dist/identity.js';
import { secret, seal, digest } from '../../apps/api/dist/security.js';
import { recoveryContext } from './recovery-context.mjs';
const context = recoveryContext();
process.loadEnvFile(context.envFile ?? new URL('../../.env', import.meta.url));
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
assert.equal(process.env.APP_MODE, 'local');
assert.equal(new URL(process.env.SUPABASE_URL).hostname, '127.0.0.1');
if (existsSync(context.fixture)) {
  assert.equal(
    JSON.parse(readFileSync(context.fixture, 'utf8')).state,
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
  operators: [],
  jobs: [],
  files: [],
};
mkdirSync(context.folder ?? 'artifacts/recovery', { recursive: true, mode: 0o700 });
const save = () =>
  writeFileSync(context.fixture, JSON.stringify(fixture, null, 2), {
    mode: 0o600,
  });
try {
  for (const name of context.isolated ? ['A', 'B', 'owner', 'reviewer'] : ['A', 'B']) {
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
    const actor = {
      name,
      accountId: account.id,
      authId: account.authId,
      sessionId: session.id,
      credential,
      provider,
    };
    if (['owner', 'reviewer'].includes(name)) {
      await db.roleAssignment.create({
        data: { accountId: account.id, role: 'm1_operator', reason: 'Fixture ' + prefix },
      });
      if (name === 'reviewer')
        await db.roleAssignment.create({
          data: {
            accountId: account.id,
            role: 'm1_access_admin',
            grantedBy: fixture.operators[0].accountId,
            reason: 'Fixture ' + prefix,
          },
        });
      const client = identity();
      assert.ok(!(await client.auth.setSession(provider)).error);
      const enrolled = await client.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Fixture ' + name,
      });
      assert.ok(!enrolled.error);
      const { generate } = await import('otplib');
      const elevated = await client.auth.mfa.challengeAndVerify({
        factorId: enrolled.data.id,
        code: await generate({ secret: enrolled.data.totp.secret }),
      });
      assert.ok(!elevated.error);
      const current = (await client.auth.getSession()).data.session;
      assert.ok(current);
      actor.provider = tokens(current);
      actor.factorId = enrolled.data.id;
      actor.factorSecret = enrolled.data.totp.secret;
      await db.session.update({
        where: { id: session.id },
        data: { providerTokens: seal(actor.provider, process.env.TOKEN_ENCRYPTION_KEY) },
      });
      fixture.operators.push(actor);
    } else fixture.actors.push(actor);
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
  if (context.isolated) {
    const accountId = fixture.actors[0].accountId;
    await db.notice.createMany({
      data: Array.from({ length: 55 }, (_, index) => ({
        accountId,
        kind: 'b12.fixture',
        text: prefix + '-aviso-' + index,
        createdAt: new Date(Date.now() - index * 1000),
      })),
    });
    const clock = new Date();
    for (const kind of ['pending', 'sending', 'expired']) {
      const job = await db.outbox.create({
        data: {
          reference: randomUUID(),
          recipient: prefix + '@example.test',
          subject: prefix + '-' + kind,
          text: 'Aviso ficticio restaurado',
          state: kind === 'sending' ? 'sending' : 'pending',
          attempts: kind === 'sending' ? 1 : 0,
          leaseUntil: kind === 'sending' ? new Date(+clock - 1000) : null,
          dueAt: new Date(+clock - 1000),
          createdAt: new Date(+clock - (kind === 'expired' ? 86400001 : 1000)),
        },
      });
      fixture.jobs.push({ id: job.id, kind });
    }
    fixture.clock = clock.toISOString();
    save();
  }
  console.log(
    'B12: dos identidades/sesiones y tres objetos ficticios preparados; credenciales solo privadas',
  );
} finally {
  await db.$disconnect();
}
