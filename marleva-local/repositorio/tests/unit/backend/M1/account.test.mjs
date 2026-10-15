import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { seal, digest } from '../../../../apps/api/src/security.ts';
const fixture = vi.hoisted(() => ({ auth: {}, admin: {} }));
vi.mock('../../../../apps/api/src/config.ts', async (original) => ({
  ...(await original()),
  config: () => ({ TOKEN_ENCRYPTION_KEY: 'a'.repeat(64), APP_ORIGIN: 'https://localhost:8443' }),
}));
vi.mock('../../../../apps/api/src/identity.ts', () => ({
  identity: () => ({ auth: fixture.auth }),
  identityAdmin: () => ({ auth: { admin: fixture.admin } }),
  authenticatedIdentity: async (tokens) => ({ client: { auth: fixture.auth }, tokens }),
  tokens: ({ access_token, refresh_token, expires_at }) => ({
    access_token,
    refresh_token,
    expires_at,
  }),
}));
const { AccountService } = await import('../../../../apps/api/src/account.service.ts');
const id = '11111111-1111-4111-8111-111111111111';
const actorId = '22222222-2222-4222-8222-222222222222';
let database, service, account, session, tokens, challenge, change, principal;
function model() {
  return Object.fromEntries(
    [
      'findUnique',
      'findUniqueOrThrow',
      'findFirst',
      'findMany',
      'update',
      'updateMany',
      'create',
      'upsert',
    ].map((name) => [
      name,
      vi
        .fn()
        .mockResolvedValue(name === 'findMany' ? [] : name === 'updateMany' ? { count: 1 } : null),
    ]),
  );
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
  account = { id: actorId, authId: id, email: 'a@example.test', state: 'active', operator: false };
  tokens = {
    access_token: 'fixture-access',
    refresh_token: 'fixture-refresh',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };
  session = {
    id,
    accountId: actorId,
    account,
    createdAt: new Date(),
    lastSeen: new Date(),
    authenticatedAt: new Date(),
    revokedAt: null,
    refreshLease: null,
    csrfHash: digest('fixture-csrf'),
    providerTokens: seal(tokens, 'a'.repeat(64)),
  };
  principal = { account, session, tokens };
  challenge = {
    id,
    email: account.email,
    state: 'open',
    attempts: 0,
    expiresAt: new Date(Date.now() + 600000),
    createdAt: new Date(Date.now() - 61000),
  };
  change = {
    id,
    accountId: actorId,
    oldEmail: account.email,
    newEmail: 'b@example.test',
    state: 'open',
    attempts: 0,
    oldConfirmed: false,
    newConfirmed: false,
    expiresAt: new Date(Date.now() + 600000),
  };
  database = Object.fromEntries(
    [
      'account',
      'session',
      'challenge',
      'emailChange',
      'audit',
      'notice',
      'outbox',
      'mfaRecovery',
    ].map((name) => [name, model()]),
  );
  database.$executeRaw = vi.fn();
  database.$transaction = vi.fn((fn) => fn(database));
  database.account.findUniqueOrThrow.mockImplementation(async () => account);
  database.account.upsert.mockImplementation(async () => account);
  database.session.findUnique.mockImplementation(async () => session);
  database.session.findUniqueOrThrow.mockImplementation(async () => session);
  database.session.create.mockResolvedValue({ id });
  database.challenge.findUnique.mockImplementation(async () => challenge);
  database.challenge.findUniqueOrThrow.mockImplementation(async () => challenge);
  database.challenge.findFirst.mockImplementation(async () => challenge);
  database.challenge.update.mockImplementation(async () => ({
    ...challenge,
    attempts: challenge.attempts + 1,
  }));
  database.emailChange.findUnique.mockImplementation(async () => change);
  database.emailChange.findUniqueOrThrow.mockImplementation(async () => change);
  database.emailChange.update.mockImplementation(async () => ({ ...change }));
  fixture.auth.signInWithOtp = vi.fn().mockResolvedValue({ error: null });
  fixture.auth.verifyOtp = vi
    .fn()
    .mockResolvedValue({ data: { session: tokens, user: { id } }, error: null });
  fixture.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id } }, error: null });
  fixture.auth.refreshSession = vi
    .fn()
    .mockResolvedValue({ data: { session: tokens }, error: null });
  fixture.auth.updateUser = vi.fn().mockResolvedValue({ error: null });
  fixture.auth.mfa = {
    listFactors: vi.fn().mockResolvedValue({ data: { totp: [] }, error: null }),
    enroll: vi.fn().mockResolvedValue({ data: { id, totp: { uri: 'fixture-only' } }, error: null }),
    challengeAndVerify: vi.fn().mockResolvedValue({ data: tokens, error: null }),
    getAuthenticatorAssuranceLevel: vi
      .fn()
      .mockResolvedValue({ data: { currentLevel: 'aal2' }, error: null }),
  };
  fixture.admin.getUserById = vi
    .fn()
    .mockResolvedValue({ data: { user: { id, email: change.newEmail } }, error: null });
  service = new AccountService(database);
});
afterEach(() => vi.useRealTimers());
const request = () => ({ headers: { authorization: 'Bearer fixture-session' }, cookies: {} });
it('UT-BE-101-A | cuota bloqueada no llama proveedor; espera exacta', async () => {
  challenge.blockedUntil = new Date(Date.now() + 90000);
  await expect(service.challenge(account.email, 'fixture-origin')).rejects.toMatchObject({
    retryAfter: 90,
  });
  expect(fixture.auth.signInWithOtp).not.toHaveBeenCalled();
  expect(database.challenge.create).not.toHaveBeenCalled();
});
it('UT-BE-101-B | reenvío y origen saturado bloquean sin reservar', async () => {
  challenge.createdAt = new Date(Date.now() - 10000);
  await expect(service.challenge(account.email, 'fixture-origin')).rejects.toMatchObject({
    retryAfter: 50,
  });
  challenge.createdAt = new Date(Date.now() - 61000);
  database.challenge.findMany.mockResolvedValue(
    Array.from({ length: 30 }, () => ({ createdAt: new Date(Date.now() - 60000) })),
  );
  await expect(service.challenge(account.email, 'fixture-origin')).rejects.toMatchObject({
    status: 429,
  });
  expect(database.challenge.create).not.toHaveBeenCalled();
});
it('UT-BE-101-C | envío fallido conserva desafío failed; éxito genérico reserva antes del proveedor', async () => {
  database.challenge.findFirst.mockResolvedValue(null);
  fixture.auth.signInWithOtp.mockResolvedValueOnce({ error: new Error('fixture failure') });
  await expect(service.challenge(account.email, 'fixture-origin')).rejects.toMatchObject({
    status: 503,
  });
  expect(database.challenge.update).toHaveBeenCalledWith(
    expect.objectContaining({ data: { state: 'failed' } }),
  );
  const result = await service.challenge(account.email, 'fixture-origin');
  expect(result.mensaje).toBe('Si el correo es válido, recibirás un código');
  expect(database.challenge.create).toHaveBeenCalledTimes(2);
});
it.each([
  undefined,
  null,
  12,
  '',
  'vecino@example.com',
  ' a@example.test',
  'a'.repeat(242) + '@example.test',
])('MAR-M1-UT-BE-101-K-%# | SEQ001:S020 | entrada inválida no reserva ni envía', async (input) => {
  await expect(service.challenge(input, 'fixture-origin')).rejects.toMatchObject({ status: 422 });
  expect(database.$transaction).not.toHaveBeenCalled();
  expect(fixture.auth.signInWithOtp).not.toHaveBeenCalled();
});
it('MAR-M1-UT-BE-101-L | SEQ001:S060 | reserva fallida no solicita OTP', async () => {
  database.challenge.create.mockRejectedValue(new Error('fixture database unavailable'));
  await expect(service.challenge(account.email, 'fixture-origin')).rejects.toThrow(
    'fixture database unavailable',
  );
  expect(fixture.auth.signInWithOtp).not.toHaveBeenCalled();
  expect(database.session.create).not.toHaveBeenCalled();
});
it('MAR-M1-UT-BE-101-M | SEQ001:S070/S100 | respuesta genérica y correo normalizado sin credenciales', async () => {
  const result = await service.challenge('VECINO@EXAMPLE.TEST', 'fixture-origin');
  expect(fixture.auth.signInWithOtp).toHaveBeenCalledWith({
    email: 'vecino@example.test',
    options: { shouldCreateUser: true },
  });
  expect(result).toEqual({
    challenge_id: expect.any(String),
    espera_segundos: 60,
    mensaje: 'Si el correo es válido, recibirás un código',
  });
  expect(database.account.upsert).not.toHaveBeenCalled();
  expect(database.session.create).not.toHaveBeenCalled();
});
it('MAR-M1-UT-BE-101-N | SEQ001:S090 | envío tardío no reabre desafío sustituido', async () => {
  let finish;
  fixture.auth.signInWithOtp.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const response = service.challenge(account.email, 'fixture-origin');
  await vi.waitFor(() => expect(fixture.auth.signInWithOtp).toHaveBeenCalledOnce());
  const reserved = database.challenge.create.mock.calls[0][0].data;
  database.challenge.updateMany.mockImplementation(async ({ where }) => {
    if (where.id === reserved.id && where.state === 'sending') return { count: 0 };
    throw new Error('Unconditional state change');
  });
  finish({ error: null });
  await expect(response).resolves.toHaveProperty('challenge_id', reserved.id);
  expect(database.challenge.update).not.toHaveBeenCalled();
  expect(database.session.create).not.toHaveBeenCalled();
});
it.each(['missing', 'consumed', 'expired', 'attempts', 'blocked'])(
  'UT-BE-102-A-%s | desafío no vigente no crea sesión',
  async (reason) => {
    if (reason === 'missing') challenge = null;
    if (reason === 'consumed') challenge.state = 'consumed';
    if (reason === 'expired') challenge.expiresAt = new Date(Date.now());
    if (reason === 'attempts') challenge.attempts = 5;
    if (reason === 'blocked') challenge.blockedUntil = new Date(Date.now() + 1000);
    await expect(service.verify(id, '123456')).rejects.toMatchObject({ status: 401 });
    expect(fixture.auth.verifyOtp).not.toHaveBeenCalled();
    expect(database.session.create).not.toHaveBeenCalled();
  },
);
it.each([0, 4])(
  'UT-BE-102-B-%i | fallo del código conserva intentos y pausa al agotarse',
  async (attempts) => {
    challenge.attempts = attempts;
    fixture.auth.verifyOtp.mockResolvedValue({ data: {}, error: new Error('fixture') });
    await expect(service.verify(id, '123456')).rejects.toMatchObject({ status: 401 });
    expect(database.challenge.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ state: attempts === 4 ? 'blocked' : 'open' }),
      }),
    );
    expect(database.session.create).not.toHaveBeenCalled();
  },
);
it('UT-BE-102-C | reenvío en vuelo y cuenta suspendida no crean sesión', async () => {
  database.challenge.findFirst.mockResolvedValueOnce({ id: actorId });
  await expect(service.verify(id, '123456')).rejects.toMatchObject({ status: 401 });
  account.state = 'suspended';
  await expect(service.verify(id, '123456')).rejects.toMatchObject({ status: 401 });
  expect(database.session.create).not.toHaveBeenCalled();
});
it('UT-BE-102-D | éxito conserva identidad y no persiste credencial opaca en claro', async () => {
  const result = await service.verify(id, '123456');
  expect(result.account.id).toBe(actorId);
  const saved = database.session.create.mock.calls[0][0].data;
  expect(saved.tokenHash).toBe(digest(result.token));
  expect(saved.tokenHash).not.toBe(result.token);
  expect(saved.providerTokens).not.toContain('fixture-refresh');
  expect(database.challenge.update).toHaveBeenLastCalledWith({
    where: { id },
    data: { state: 'consumed' },
  });
});
it.each(['absent', 'long', 'origin', 'revoked', 'inactive'])(
  'UT-BE-103-A-%s | sesión inválida denegada',
  async (reason) => {
    const req = request();
    if (reason === 'absent') req.headers = {};
    if (reason === 'long') req.headers.authorization = 'Bearer ' + 'a'.repeat(201);
    if (reason === 'origin') req.headers.origin = 'https://localhost:8443';
    if (reason === 'revoked') session.revokedAt = new Date();
    if (reason === 'inactive') account.state = 'suspended';
    await expect(service.principal(req)).rejects.toMatchObject({
      status: reason === 'origin' ? 403 : 401,
    });
    expect(fixture.auth.getUser).not.toHaveBeenCalled();
  },
);
it.each([false, true])(
  'UT-BE-103-B-%s | límite máximo revoca usuario y operador',
  async (operator) => {
    account.operator = operator;
    session.createdAt = new Date(Date.now() - (operator ? 8 * 3600 : 30 * 86400) * 1000);
    await expect(service.principal(request())).rejects.toMatchObject({ status: 401 });
    expect(database.session.update).toHaveBeenCalledWith({
      where: { id },
      data: { revokedAt: expect.any(Date) },
    });
  },
);
it('UT-BE-103-C | mutación web exige origen y CSRF; cookie válida funciona', async () => {
  const req = {
    headers: { origin: 'https://localhost:8443' },
    cookies: { marleva_session: 'fixture-session' },
  };
  await expect(service.principal(req, true)).rejects.toMatchObject({ status: 403 });
  req.headers['x-csrf-token'] = 'fixture-csrf';
  expect((await service.principal(req, true)).account.id).toBe(actorId);
});
it('UT-BE-103-D | identidad ajena o revocación en vuelo deniegan', async () => {
  fixture.auth.getUser.mockResolvedValueOnce({ data: { user: { id: actorId } }, error: null });
  await expect(service.principal(request())).rejects.toMatchObject({ status: 401 });
  database.session.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(service.principal(request())).rejects.toMatchObject({ status: 401 });
});
it('UT-BE-103-E | refresh fallido libera lease; éxito guarda cifrado', async () => {
  tokens.expires_at = 0;
  session.providerTokens = seal(tokens, 'a'.repeat(64));
  fixture.auth.refreshSession.mockResolvedValueOnce({ data: {}, error: new Error('fixture') });
  await expect(service.principal(request())).rejects.toMatchObject({ status: 401 });
  expect(database.session.update).toHaveBeenLastCalledWith({
    where: { id },
    data: { refreshLease: null },
  });
  expect((await service.principal(request())).account.id).toBe(actorId);
});
it('UT-BE-104-A | salida actual/total auditadas; total exige acceso reciente', async () => {
  await service.logout(principal);
  expect(database.session.updateMany).toHaveBeenLastCalledWith(
    expect.objectContaining({ where: { id } }),
  );
  await service.logout(principal, true);
  expect(database.session.updateMany).toHaveBeenLastCalledWith(
    expect.objectContaining({ where: { accountId: actorId } }),
  );
  session.authenticatedAt = new Date(Date.now() - 301000);
  await expect(service.logout(principal, true)).rejects.toMatchObject({ status: 403 });
});
it('UT-BE-105-A | correo igual, ocupado o cambio vigente no llama proveedor', async () => {
  await expect(service.emailChange(principal, account.email)).rejects.toMatchObject({
    status: 422,
  });
  database.account.findUnique.mockResolvedValueOnce({ id });
  await expect(service.emailChange(principal, change.newEmail)).rejects.toMatchObject({
    status: 409,
  });
  database.emailChange.findFirst.mockResolvedValueOnce(change);
  await expect(service.emailChange(principal, change.newEmail)).rejects.toMatchObject({
    status: 409,
  });
  expect(fixture.auth.updateUser).not.toHaveBeenCalled();
});
it('UT-BE-105-B | cambio fallido queda failed; éxito espera ambos buzones', async () => {
  fixture.auth.updateUser.mockResolvedValueOnce({ error: new Error('fixture') });
  await expect(service.emailChange(principal, change.newEmail)).rejects.toMatchObject({
    status: 503,
  });
  expect(database.emailChange.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ data: { state: 'failed' } }),
  );
  expect((await service.emailChange(principal, change.newEmail)).estado).toBe(
    'verificar_ambos_buzones',
  );
});
it.each(['foreign', 'expired', 'attempts', 'state', 'mailbox', 'already'])(
  'UT-BE-106-A-%s | confirmación inválida no verifica con proveedor',
  async (reason) => {
    if (reason === 'foreign') change.accountId = id;
    if (reason === 'expired') change.expiresAt = new Date(Date.now() - 1);
    if (reason === 'attempts') change.attempts = 5;
    if (reason === 'state') change.state = 'complete';
    if (reason === 'already') change.oldConfirmed = true;
    await expect(
      service.confirmEmail(
        principal,
        id,
        reason === 'mailbox' ? 'c@example.test' : account.email,
        '123456',
      ),
    ).rejects.toMatchObject({
      status: reason === 'foreign' ? 404 : reason === 'mailbox' ? 422 : 409,
    });
    expect(fixture.auth.verifyOtp).not.toHaveBeenCalled();
  },
);
it('UT-BE-106-B | primera confirmación conserva correo; fallo permite corregir código', async () => {
  fixture.auth.verifyOtp.mockResolvedValueOnce({ error: new Error('fixture') });
  await expect(service.confirmEmail(principal, id, account.email, '123456')).rejects.toMatchObject({
    status: 401,
  });
  expect((await service.confirmEmail(principal, id, account.email, '123456')).estado).toBe(
    'falta_otro_buzon',
  );
  expect(database.account.update).not.toHaveBeenCalled();
});
it('UT-BE-106-C | proveedor no actualizado deja reconcile; completo revoca y avisa ambos', async () => {
  change.oldConfirmed = true;
  fixture.admin.getUserById.mockResolvedValueOnce({
    data: { user: { email: account.email } },
    error: null,
  });
  await expect(
    service.confirmEmail(principal, id, change.newEmail, '123456'),
  ).rejects.toMatchObject({ status: 503 });
  expect(database.emailChange.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ data: expect.objectContaining({ state: 'reconcile' }) }),
  );
  expect((await service.confirmEmail(principal, id, change.newEmail, '123456')).estado).toBe(
    'completo',
  );
  expect(database.notice.create).toHaveBeenCalledTimes(1);
  expect(database.outbox.create).toHaveBeenCalledTimes(2);
  change.state = 'complete';
  await service.finishEmailChange(id, actorId, account.email, change.newEmail);
  expect(database.notice.create).toHaveBeenCalledTimes(1);
});
it('UT-BE-106-D | reconcile no finaliza mientras proveedor difiere y después conserva ID', async () => {
  database.emailChange.findMany.mockResolvedValue([change]);
  fixture.admin.getUserById.mockResolvedValueOnce({
    data: { user: { email: account.email } },
    error: null,
  });
  await service.reconcile();
  expect(database.account.update).not.toHaveBeenCalled();
  await service.reconcile();
  expect(database.account.update).toHaveBeenCalledWith({
    where: { id: actorId },
    data: { email: change.newEmail },
  });
});
it('UT-BE-103-F-CSRF | CSRF se rota como hash, sin cambiar sesión', async () => {
  const result = await service.csrf(principal);
  expect(database.session.update).toHaveBeenCalledWith({
    where: { id },
    data: { csrfHash: digest(result.csrf_token) },
  });
});
it('UT-BE-107-A | registro normal no enrola ni verifica ni obtiene permiso', async () => {
  for (const fn of [
    () => service.enroll(principal),
    () => service.verifyFactor(principal, id, '123456'),
    () => service.operator(principal),
  ])
    await expect(fn()).rejects.toMatchObject({ status: 403 });
  expect(fixture.auth.mfa.enroll).not.toHaveBeenCalled();
});
it('UT-BE-107-B | operador exige factor válido y AAL2; auditoría de verificación', async () => {
  account.operator = true;
  fixture.auth.mfa.enroll.mockResolvedValueOnce({ error: new Error('fixture') });
  await expect(service.enroll(principal)).rejects.toMatchObject({ status: 409 });
  expect((await service.enroll(principal)).id).toBe(id);
  fixture.auth.mfa.challengeAndVerify.mockResolvedValueOnce({ error: new Error('fixture') });
  await expect(service.verifyFactor(principal, id, '123456')).rejects.toMatchObject({
    status: 401,
  });
  expect((await service.verifyFactor(principal, id, '123456')).estado).toBe('factor_verificado');
  fixture.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce({
    data: { currentLevel: 'aal1' },
  });
  await expect(service.operator(principal)).rejects.toMatchObject({ status: 403 });
  expect((await service.operator(principal)).estado).toBe('operador_autenticado');
});

it('UT-BE-114-EXPIRED | recuperación aprobada vencida impide saltar el proceso', async () => {
  account.operator = true;
  database.mfaRecovery.findFirst.mockResolvedValue({ state: 'expired', approvedBy: id });
  await expect(service.enroll(principal)).rejects.toMatchObject({ status: 409 });
  await expect(service.verifyFactor(principal, id, '123456')).rejects.toMatchObject({
    status: 409,
  });
  await expect(service.operator(principal)).rejects.toMatchObject({ status: 409 });
  expect(fixture.auth.mfa.enroll).not.toHaveBeenCalled();
  expect(fixture.auth.mfa.challengeAndVerify).not.toHaveBeenCalled();
});
it('UT-BE-114-AAL2 | agregar un segundo factor requiere AAL2', async () => {
  account.operator = true;
  fixture.auth.mfa.listFactors.mockResolvedValue({
    data: { totp: [{ status: 'verified' }] },
    error: null,
  });
  fixture.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
    data: { currentLevel: 'aal1' },
    error: null,
  });
  await expect(service.enroll(principal)).rejects.toMatchObject({ status: 403 });
  expect(fixture.auth.mfa.enroll).not.toHaveBeenCalled();
});

it('UT-BE-103-F-REFRESH | espera al dueño de renovación y usa su token vigente', async () => {
  tokens.expires_at = Math.floor(Date.now() / 1000);
  session.providerTokens = seal(tokens, 'a'.repeat(64));
  database.session.updateMany.mockResolvedValueOnce({ count: 0 });
  const work = service.principal(request());
  await vi.advanceTimersByTimeAsync(100);
  expect((await work).account.id).toBe(actorId);
  expect(fixture.auth.refreshSession).not.toHaveBeenCalled();
});
it('UT-BE-103-G | renovación ajena que no termina conserva error recuperable', async () => {
  tokens.expires_at = Math.floor(Date.now() / 1000);
  session.providerTokens = seal(tokens, 'a'.repeat(64));
  session.refreshLease = new Date(Date.now() + 15000);
  database.session.updateMany.mockResolvedValueOnce({ count: 0 });
  const work = expect(service.principal(request())).rejects.toMatchObject({ status: 503 });
  await vi.advanceTimersByTimeAsync(3000);
  await work;
  expect(fixture.auth.getUser).not.toHaveBeenCalled();
});
