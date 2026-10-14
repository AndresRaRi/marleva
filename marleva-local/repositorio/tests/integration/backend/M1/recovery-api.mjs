import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { generate } from 'otplib';
process.loadEnvFile('.env');
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const copy = JSON.parse(readFileSync('tests/results/recovery-copy.json'));
const stack = JSON.parse(
  readFileSync(`artifacts/recovery/${copy.names.prefix}/provider/stack.private.json`),
);
assert.equal(stack.copyPrefix, copy.names.prefix);
assert.equal(stack.environment.SUPABASE_URL, 'http://127.0.0.1:54421');
const docker = (args, input) =>
  execFileSync('./scripts/tool', ['docker', ...args], {
    input,
    encoding: 'utf8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
const target = JSON.parse(docker(['inspect', stack.names.db]))[0];
assert.equal(target.Config.Labels['marleva.b12.run'], stack.run);
assert.ok(target.State.Running);
const migrationUrl = new URL(process.env.MIGRATION_DATABASE_URL);
migrationUrl.port = '54422';
assert.equal(migrationUrl.hostname, '127.0.0.1');
Object.assign(process.env, stack.environment, {
  SMTP_PORT: '54425',
  MARLEVA_TEST: '1',
  MIGRATION_DATABASE_URL: migrationUrl.toString(),
});
const run = 'recovery-api-' + Date.now(),
  folder = 'artifacts/recovery/' + run;
mkdirSync(folder, { recursive: true, mode: 0o700 });
const report = {
  date: new Date().toISOString(),
  id: 'MAR-M1-IT-BE-114–121-HTTP',
  copyPrefix: copy.names.prefix,
  cases: {},
  limits: [
    'Solo backend/API en proveedor aislado; pantallas/Safari/Android/iOS/aceptación visual pendientes',
    'Personas/roles del ensayo ficticios, no autorización de operadores reales',
  ],
};
const started = Date.now();
let app,
  db,
  admin,
  authStopped = false,
  prepared = [];
const call = async (path, method = 'GET', body, token, extra = {}) => {
  const response = await fetch('http://127.0.0.1:3001/v1' + path, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-marleva-client': 'native',
      ...(token ? { authorization: 'Bearer ' + token } : {}),
      ...extra,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  return { status: response.status, body: data, headers: response.headers };
};
const expectStatus = (result, status, label) =>
  assert.equal(
    result.status,
    status,
    label + '; código ' + String(result.body.codigo ?? 'sin código'),
  );
const idempotency = (key) => ({ 'idempotency-key': run + '-' + key });
try {
  const deploy = execFileSync('./scripts/tool', ['pnpm', '--filter', '@marleva/api', 'migrate'], {
    env: process.env,
    encoding: 'utf8',
    timeout: 60000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  writeFileSync(folder + '/migration.private.log', deploy, { mode: 0o600 });
  report.cases.prismaDeployTargetOnly = true;
  report.migrationSha256 = createHash('sha256')
    .update(readFileSync('apps/api/prisma/migrations/202610140001_mfa_recovery/migration.sql'))
    .digest('hex');
  const { database } = await import('../../../../apps/api/dist/database.js');
  db = database();
  const { identityAdmin, identity, tokens } = await import('../../../../apps/api/dist/identity.js');
  admin = identityAdmin();
  const { secret, digest, seal } = await import('../../../../apps/api/dist/security.js');
  const prepare = async (name, grantedBy) => {
    const email = run + '-' + name + '@example.test';
    const link = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    assert.ok(!link.error);
    prepared.push(link.data.user.id);
    const verified = await identity().auth.verifyOtp({
      type: link.data.properties.verification_type,
      token_hash: link.data.properties.hashed_token,
    });
    assert.ok(!verified.error && verified.data.session);
    const account = await db.account.create({ data: { authId: verified.data.user.id, email } });
    await db.roleAssignment.create({
      data: { accountId: account.id, role: 'm1_operator', reason: 'Fixture ' + run },
    });
    if (grantedBy)
      await db.roleAssignment.create({
        data: {
          accountId: account.id,
          role: 'm1_access_admin',
          grantedBy,
          reason: 'Fixture de revisión ' + run,
        },
      });
    const token = secret();
    await db.session.create({
      data: {
        accountId: account.id,
        tokenHash: digest(token),
        csrfHash: digest(secret()),
        providerTokens: seal(tokens(verified.data.session), process.env.TOKEN_ENCRYPTION_KEY),
      },
    });
    return { account, token };
  };
  const owner = await prepare('owner'),
    reviewer = await prepare('reviewer', owner.account.id);
  const { makeApp } = await import('../../../../apps/api/dist/main.js');
  app = await makeApp();
  await app.listen(3001, '127.0.0.1');
  const { ProcessMfaRecoveries } =
    await import('../../../../apps/api/dist/modules/m1/application/use-cases/process-mfa-recoveries.js');
  const processRecovery = app.get(ProcessMfaRecoveries);
  const factor = async (actor) => {
    const enrolled = await call('/auth/mfa/enrollments', 'POST', {}, actor.token);
    expectStatus(enrolled, 201, 'Enrolamiento básico');
    expectStatus(
      await call(
        '/auth/mfa/verifications',
        'POST',
        {
          factor_id: enrolled.body.id,
          codigo: await generate({ secret: enrolled.body.totp.secret }),
        },
        actor.token,
      ),
      201,
      'Verificación básica',
    );
    expectStatus(
      await call('/operator/access', 'GET', undefined, actor.token),
      200,
      'Operador AAL2',
    );
    return enrolled.body;
  };
  const lost = await factor(owner);
  let result = await call(
    '/auth/mfa-recoveries',
    'POST',
    { reason: 'Factor ficticio perdido' },
    owner.token,
    idempotency('request'),
  );
  expectStatus(result, 202, 'Solicitud');
  const recoveryId = result.body.id;
  assert.deepEqual(Object.keys(result.body).sort(), ['id', 'state', 'version']);
  expectStatus(
    await call(
      '/auth/mfa-recoveries',
      'POST',
      { reason: 'Otro cuerpo' },
      owner.token,
      idempotency('request'),
    ),
    409,
    'Clave contradictoria',
  );
  const repeat = await call(
    '/auth/mfa-recoveries',
    'POST',
    { reason: 'Factor ficticio perdido' },
    owner.token,
    idempotency('request'),
  );
  expectStatus(repeat, 202, 'Repetición');
  assert.equal(repeat.body.id, recoveryId);
  expectStatus(
    await call(
      '/auth/mfa-recoveries',
      'POST',
      { reason: 'Nueva solicitud' },
      owner.token,
      idempotency('another'),
    ),
    409,
    'Proceso activo único',
  );
  expectStatus(
    await call(
      '/auth/mfa-recoveries',
      'POST',
      { reason: 'x', role: 'm1_access_admin' },
      owner.token,
      idempotency('invalid'),
    ),
    422,
    'Campos extra',
  );
  expectStatus(
    await call('/auth/mfa/enrollments', 'POST', {}, owner.token),
    409,
    'Ruta normal no salta recuperación',
  );
  expectStatus(
    await call(
      '/auth/mfa-recoveries/' + recoveryId + '/approvals',
      'POST',
      { expected_version: 1 },
      owner.token,
      idempotency('self'),
    ),
    403,
    'Autorrevisión',
  );
  expectStatus(
    await call('/auth/mfa-recoveries/' + recoveryId, 'GET', undefined, reviewer.token),
    404,
    'Consulta ajena AAL1',
  );
  expectStatus(
    await call(
      '/auth/mfa-recoveries/' + recoveryId + '/approvals',
      'POST',
      { expected_version: 1 },
      reviewer.token,
      idempotency('aal1'),
    ),
    403,
    'Revisión AAL1',
  );
  await factor(reviewer);
  expectStatus(
    await call('/auth/mfa-recoveries/' + recoveryId, 'GET', undefined, reviewer.token),
    200,
    'Consulta administrador',
  );
  const approved = await call(
    '/auth/mfa-recoveries/' + recoveryId + '/approvals',
    'POST',
    { expected_version: 1 },
    reviewer.token,
    idempotency('approve'),
  );
  expectStatus(approved, 202, 'Aprobación durable');
  assert.equal(approved.body.state, 'approved');
  expectStatus(
    await call('/me', 'GET', undefined, owner.token),
    401,
    'Sesión anterior revocada antes de proveedor',
  );
  report.cases.requestReadApprovalPrivacyIdempotencyAndSessionRevocation = true;
  docker(['stop', '--time', '10', stack.names.auth]);
  authStopped = true;
  await processRecovery.execute();
  assert.equal(
    (await db.mfaRecovery.findUniqueOrThrow({ where: { id: recoveryId } })).state,
    'provider_pending',
  );
  report.cases.providerDownKeepsDurablePending = true;
  docker(['start', stack.names.auth]);
  authStopped = false;
  let healthy = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(process.env.SUPABASE_URL + '/auth/v1/health', {
        headers: { apikey: process.env.SUPABASE_ANON_KEY },
        signal: AbortSignal.timeout(1000),
      });
      if (r.ok) {
        healthy = true;
        break;
      }
    } catch {
      /* Bounded readiness. */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(healthy);
  await processRecovery.execute();
  let row = await db.mfaRecovery.findUniqueOrThrow({ where: { id: recoveryId } });
  assert.equal(row.state, 'reenrollment');
  const oldFactors = await admin.auth.admin.mfa.listFactors({ userId: owner.account.authId });
  assert.ok(!oldFactors.error && !oldFactors.data.factors.some((f) => f.id === lost.id));
  report.cases.restartedWorkerConfirmsLostFactorAbsent = true;
  const login = async () => {
    const latest = await db.challenge.findFirst({
      where: { email: owner.account.email },
      orderBy: { createdAt: 'desc' },
    });
    const delay = latest ? Math.max(0, 61000 - (Date.now() - +latest.createdAt)) : 0;
    if (delay) {
      console.log(
        'Ensayo: respetar espera real de reenvío OTP (' + Math.ceil(delay / 1000) + ' s)',
      );
      await new Promise((r) => setTimeout(r, delay));
    }
    const since = Date.now();
    const challenge = await call('/auth/challenges', 'POST', { correo: owner.account.email });
    expectStatus(challenge, 201, 'OTP nuevo');
    let otp;
    for (let i = 0; i < 100; i++) {
      const messages = await (await fetch('http://127.0.0.1:54424/api/v1/messages')).json();
      const message = messages.messages.find(
        (m) => m.To.some((t) => t.Address === owner.account.email) && +new Date(m.Created) >= since,
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
    const verified = await call('/auth/verifications', 'POST', {
      challenge_id: challenge.body.challenge_id,
      codigo: otp,
    });
    expectStatus(verified, 201, 'Verificar OTP');
    assert.equal(verified.body.cuenta.id, owner.account.id);
    return verified.body.session_token;
  };
  const freshToken = await login();
  expectStatus(
    await call('/operator/access', 'GET', undefined, freshToken),
    409,
    'Recuperación incompleta no habilita al operador',
  );
  const freshRead = await call('/auth/mfa-recoveries/' + recoveryId, 'GET', undefined, freshToken);
  expectStatus(freshRead, 200, 'Consulta propia nueva');
  const cap = await call(
    '/auth/mfa-recoveries/' + recoveryId + '/capabilities',
    'POST',
    { expected_version: freshRead.body.version },
    freshToken,
    idempotency('cap'),
  );
  expectStatus(cap, 201, 'Capacidad');
  const capAgain = await call(
    '/auth/mfa-recoveries/' + recoveryId + '/capabilities',
    'POST',
    { expected_version: freshRead.body.version },
    freshToken,
    idempotency('cap'),
  );
  expectStatus(capAgain, 201, 'Capacidad repetida');
  assert.ok(cap.body.capability === capAgain.body.capability);
  const privateHeader = { 'x-recovery-capability': cap.body.capability };
  row = await db.mfaRecovery.findUniqueOrThrow({ where: { id: recoveryId } });
  expectStatus(
    await call(
      '/auth/mfa-recoveries/' + recoveryId + '/enrollments',
      'POST',
      { expected_version: row.version },
      reviewer.token,
      { ...idempotency('foreign'), ...privateHeader },
    ),
    404,
    'Capacidad ajena',
  );
  expectStatus(
    await call(
      '/auth/mfa-recoveries/' + recoveryId + '/enrollments',
      'POST',
      { expected_version: row.version },
      freshToken,
      idempotency('missing'),
    ),
    403,
    'Capacidad ausente',
  );
  const enrollVersion = row.version;
  const enrolled = await call(
    '/auth/mfa-recoveries/' + recoveryId + '/enrollments',
    'POST',
    { expected_version: enrollVersion },
    freshToken,
    { ...idempotency('enroll'), ...privateHeader },
  );
  expectStatus(enrolled, 201, 'Factor nuevo');
  const again = await call(
    '/auth/mfa-recoveries/' + recoveryId + '/enrollments',
    'POST',
    { expected_version: enrollVersion },
    freshToken,
    { ...idempotency('enroll'), ...privateHeader },
  );
  expectStatus(again, 201, 'Enrolamiento repetido');
  assert.ok(
    again.body.factor_id === enrolled.body.factor_id && again.body.uri === enrolled.body.uri,
  );
  const factorSecret = new URL(enrolled.body.uri).searchParams.get('secret');
  assert.ok(factorSecret);
  row = await db.mfaRecovery.findUniqueOrThrow({ where: { id: recoveryId } });
  expectStatus(
    await call(
      '/auth/mfa-recoveries/' + recoveryId + '/verifications',
      'POST',
      { expected_version: row.version, factor_id: lost.id, codigo: '000000' },
      freshToken,
      { ...idempotency('wrong-factor'), ...privateHeader },
    ),
    403,
    'Factor no reservado',
  );
  const valid = await generate({ secret: factorSecret });
  const completed = await call(
    '/auth/mfa-recoveries/' + recoveryId + '/verifications',
    'POST',
    { expected_version: row.version, factor_id: enrolled.body.factor_id, codigo: valid },
    freshToken,
    { ...idempotency('verify'), ...privateHeader },
  );
  expectStatus(completed, 201, 'Completar recuperación');
  assert.equal(completed.body.state, 'completed');
  expectStatus(await call('/me', 'GET', undefined, freshToken), 401, 'Sesión limitada revocada');
  const persisted = await db.mfaRecovery.findUniqueOrThrow({ where: { id: recoveryId } });
  assert.ok(persisted.capabilityConsumedAt);
  assert.ok(!JSON.stringify(persisted.operations).includes(factorSecret));
  assert.ok(!JSON.stringify(persisted.operations).includes(cap.body.capability));
  report.cases.newOtpBoundCapabilityIdempotentEnrollmentAndCompletion = true;
  const finalToken = await login();
  expectStatus(
    await call('/operator/access', 'GET', undefined, finalToken),
    403,
    'OTP final aún necesita factor',
  );
  expectStatus(
    await call(
      '/auth/mfa/verifications',
      'POST',
      { factor_id: enrolled.body.factor_id, codigo: await generate({ secret: factorSecret }) },
      finalToken,
    ),
    201,
    'AAL2 final',
  );
  expectStatus(
    await call('/operator/access', 'GET', undefined, finalToken),
    200,
    'Acceso recuperado',
  );
  const rejectedRequest = await call(
    '/auth/mfa-recoveries',
    'POST',
    { reason: 'Segunda solicitud ficticia' },
    finalToken,
    idempotency('reject-request'),
  );
  expectStatus(rejectedRequest, 202, 'Solicitud para rechazo');
  const rejected = await call(
    '/auth/mfa-recoveries/' + rejectedRequest.body.id + '/rejections',
    'POST',
    { expected_version: rejectedRequest.body.version, reason: 'Ensayo de rechazo' },
    reviewer.token,
    idempotency('reject'),
  );
  expectStatus(rejected, 200, 'Rechazo');
  assert.equal(rejected.body.state, 'rejected');
  report.cases.freshOtpAndAal2ThenAdministrativeRejection = true;
  const role = await db.roleAssignment.findFirstOrThrow({
    where: { accountId: reviewer.account.id, role: 'm1_access_admin', revokedAt: null },
  });
  await db.roleAssignment.update({
    where: { id: role.id },
    data: { revokedAt: new Date(), revokedBy: owner.account.id },
  });
  expectStatus(
    await call('/auth/mfa-recoveries/' + recoveryId, 'GET', undefined, reviewer.token),
    404,
    'Rol revocado con AAL2 vivo',
  );
  report.cases.currentRoleRevocationDeniesAccess = true;
  report.result = 'PASS';
  report.durationMs = Date.now() - started;
  console.log(
    'UC014: siete rutas HTTP, revocación, caída/reinicio, capacidad, reenrolamiento y permisos pasaron',
  );
} catch (error) {
  report.result = 'FAIL';
  report.error = 'Fallo de integración; detalle privado';
  writeFileSync(folder + '/failure.private.log', String(error.stack), { mode: 0o600 });
  process.exitCode = 1;
} finally {
  if (authStopped) docker(['start', stack.names.auth]);
  if (app) {
    await app.close();
    const { AccountService } = await import('../../../../apps/api/dist/account.service.js');
    await app.get(AccountService).db.$disconnect();
  }
  if (db)
    for (const authId of prepared) {
      const account = await db.account.findUnique({ where: { authId } });
      if (account) {
        await db.roleAssignment.updateMany({
          where: { accountId: account.id, revokedAt: null },
          data: { revokedAt: new Date(), revokedBy: account.id },
        });
        await db.session.updateMany({
          where: { accountId: account.id },
          data: { revokedAt: new Date() },
        });
        await db.account.update({ where: { id: account.id }, data: { state: 'suspended' } });
      }
    }
  await db?.$disconnect();
  report.cleanup =
    'API del ensayo cerrada; actores propios suspendidos, roles y sesiones revocados; Auth destino activo';
  writeFileSync(
    'tests/results/recovery-api' + (report.result === 'FAIL' ? '-failure' : '') + '.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
