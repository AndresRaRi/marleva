import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { generate } from 'otplib';
process.loadEnvFile('.env');
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const copy = JSON.parse(readFileSync('tests/results/recovery-copy.json'));
const stack = JSON.parse(
  readFileSync(`artifacts/recovery/${copy.names.prefix}/provider/stack.private.json`),
);
assert.equal(stack.copyPrefix, copy.names.prefix);
assert.equal(stack.environment.SUPABASE_URL, 'http://127.0.0.1:54421');
Object.assign(process.env, stack.environment, { SMTP_PORT: '54425' });
const { database } = await import('../../../../apps/api/dist/database.js');
const { identity, identityAdmin, tokens, authenticatedIdentity } =
  await import('../../../../apps/api/dist/identity.js');
const { AccountService } = await import('../../../../apps/api/dist/account.service.js');
const { secret, digest, seal } = await import('../../../../apps/api/dist/security.js');
const { AuthorizeRecoveryReview } =
  await import('../../../../apps/api/dist/modules/m1/application/use-cases/authorize-recovery-review.js');
const db = database(),
  service = new AccountService(db),
  admin = identityAdmin();
const run = 'operator-recovery-' + Date.now(),
  folder = 'artifacts/recovery/' + run;
mkdirSync(folder, { recursive: true, mode: 0o700 });
const report = {
  date: new Date().toISOString(),
  id: 'MAR-M1-IT-BE-114-PROVIDER',
  copyPrefix: copy.names.prefix,
  cases: {},
  limits: [
    'Prueba SDK/proveedor y permisos básicos existentes; no siete endpoints ni tabla RoleAssignment runtime',
    'Permiso m1_access_admin del revisor es fixture del puerto; no gestión real de roles',
    'Sin capacidad limitada, idempotencia durable, conciliación tras caída ni UI; UC014 incompleto',
    'Refresh revocado; JWT del proveedor puede conservar validez hasta expiración. Marleva deniega por sesión revocada',
  ],
};
const prepared = [];
const principal = (token) =>
  service.principal({ headers: { authorization: 'Bearer ' + token }, cookies: {} });
async function prepare(name) {
  const email = run + '-' + name + '@example.test';
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  assert.ok(!link.error && link.data.user);
  prepared.push(link.data.user.id);
  const v = await identity().auth.verifyOtp({
    type: link.data.properties.verification_type,
    token_hash: link.data.properties.hashed_token,
  });
  assert.ok(!v.error && v.data.session);
  const account = await db.account.create({
    data: { authId: v.data.user.id, email, operator: true },
  });
  const token = secret();
  await db.session.create({
    data: {
      accountId: account.id,
      tokenHash: digest(token),
      csrfHash: digest(secret()),
      providerTokens: seal(tokens(v.data.session), process.env.TOKEN_ENCRYPTION_KEY),
    },
  });
  return { account, token };
}
async function factor(actor) {
  const enrolled = await service.enroll(await principal(actor.token));
  await service.verifyFactor(
    await principal(actor.token),
    enrolled.id,
    await generate({ secret: enrolled.totp.secret }),
  );
  await service.operator(await principal(actor.token));
  return enrolled.id;
}
async function login(email) {
  const since = Date.now(),
    challenge = await service.challenge(email, run);
  let otp;
  for (let i = 0; i < 100; i++) {
    const messages = await (await fetch('http://127.0.0.1:54424/api/v1/messages')).json();
    const message = messages.messages.find(
      (m) => m.To.some((t) => t.Address === email) && +new Date(m.Created) >= since,
    );
    if (message) {
      const content = await (
        await fetch('http://127.0.0.1:54424/api/v1/message/' + message.ID)
      ).json();
      otp = (content.Text + ' ' + content.HTML).match(/\b\d{6}\b/)?.[0];
      if (otp) break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(otp);
  return service.verify(challenge.challenge_id, otp);
}
try {
  const owner = await prepare('owner'),
    reviewer = await prepare('reviewer');
  const oldFactor = await factor(owner);
  const reviewPrincipal = await principal(reviewer.token);
  const review = {
    accountId: reviewer.account.id,
    sessionId: reviewPrincipal.session.id,
    authenticatedAt: reviewPrincipal.session.authenticatedAt,
  };
  let allowed = true;
  const authorize = new AuthorizeRecoveryReview({
    accessAdmin: async (id) => allowed && id === reviewer.account.id,
    assurance: async () => {
      const p = await principal(reviewer.token),
        { client } = await authenticatedIdentity(p.tokens);
      const result = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      assert.ok(!result.error);
      return result.data.currentLevel;
    },
  });
  await assert.rejects(
    authorize.execute({ ...review, accountId: owner.account.id }, owner.account.id),
    (e) => e.getStatus() === 403,
  );
  allowed = false;
  await assert.rejects(authorize.execute(review, owner.account.id), (e) => e.getStatus() === 403);
  allowed = true;
  await assert.rejects(authorize.execute(review, owner.account.id), (e) => e.getStatus() === 403);
  await factor(reviewer);
  await assert.rejects(
    authorize.execute(
      { ...review, authenticatedAt: new Date(Date.now() - 300001) },
      owner.account.id,
    ),
    (e) => e.getStatus() === 403,
  );
  await authorize.execute(review, owner.account.id);
  report.cases.selfUnprivilegedAal1AndStaleDenied = true;
  const oldPrincipal = await principal(owner.token);
  await db.session.updateMany({
    where: { accountId: owner.account.id },
    data: { revokedAt: new Date() },
  });
  const signedOut = await admin.auth.admin.signOut(oldPrincipal.tokens.access_token, 'global');
  assert.ok(!signedOut.error);
  const refreshed = await identity().auth.refreshSession({
    refresh_token: oldPrincipal.tokens.refresh_token,
  });
  assert.ok(refreshed.error && !refreshed.data.session);
  await assert.rejects(principal(owner.token), (e) => e.getStatus() === 401);
  report.cases.oldMarlevaSessionsAndProviderRefreshRejected = true;
  const removed = await admin.auth.admin.mfa.deleteFactor({
    userId: owner.account.authId,
    id: oldFactor,
  });
  assert.ok(!removed.error);
  const factors = await admin.auth.admin.mfa.listFactors({ userId: owner.account.authId });
  assert.ok(!factors.error && !factors.data.factors.some((f) => f.id === oldFactor));
  report.cases.lostFactorRemovalConfirmed = true;
  const fresh = await login(owner.account.email);
  assert.equal(fresh.account.id, owner.account.id);
  await assert.rejects(
    service.operator(await principal(fresh.token)),
    (e) => e.getStatus() === 403,
  );
  const newFactor = await factor({ account: owner.account, token: fresh.token });
  assert.notEqual(newFactor, oldFactor);
  report.cases.realNewOtpAndNewTotpRestoreAccountWithoutAal1Privilege = true;
  await db.account.update({ where: { id: owner.account.id }, data: { operator: false } });
  await assert.rejects(
    service.operator(await principal(fresh.token)),
    (e) => e.getStatus() === 403,
  );
  report.cases.permissionRevocationDeniesLiveAal2Session = true;
  report.result = 'PASS';
  console.log(
    'UC014 proveedor: revisión distinta/AAL2, revocación, factor perdido, OTP y TOTP nuevos pasaron; API de recuperación pendiente',
  );
} catch (error) {
  report.result = 'FAIL';
  report.error =
    error instanceof assert.AssertionError ? error.message : 'Fallo del proveedor; detalle privado';
  writeFileSync(folder + '/failure.private.log', String(error.stack), { mode: 0o600 });
  process.exitCode = 1;
} finally {
  for (const authId of prepared) {
    const account = await db.account.findUnique({ where: { authId } });
    if (account) {
      await db.session.updateMany({
        where: { accountId: account.id },
        data: { revokedAt: new Date() },
      });
      await db.account.update({
        where: { id: account.id },
        data: { operator: false, state: 'suspended' },
      });
    }
    const factors = await admin.auth.admin.mfa.listFactors({ userId: authId });
    if (!factors.error)
      for (const f of factors.data.factors)
        await admin.auth.admin.mfa.deleteFactor({ userId: authId, id: f.id });
  }
  await db.$disconnect();
  report.cleanup =
    'Solo operadores ficticios creados en destino quedan suspendidos, sin rol/factores y con sesiones revocadas; origen intacto';
  writeFileSync(
    'tests/results/recovery-operator-provider' +
      (report.result === 'FAIL' ? '-failure' : '') +
      '.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
