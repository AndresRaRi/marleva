import { beforeEach, it, expect, vi } from 'vitest';
vi.mock('../../../../apps/api/src/config.ts', () => ({
  config: () => ({ TOKEN_ENCRYPTION_KEY: 'a'.repeat(64) }),
}));
import { RecoveryContext } from '../../../../apps/api/src/modules/m1/application/use-cases/recovery-context.ts';
import { RequestMfaRecovery } from '../../../../apps/api/src/modules/m1/application/use-cases/request-mfa-recovery.ts';
import { ReadMfaRecovery } from '../../../../apps/api/src/modules/m1/application/use-cases/read-mfa-recovery.ts';
import { ReviewMfaRecovery } from '../../../../apps/api/src/modules/m1/application/use-cases/review-mfa-recovery.ts';
import { IssueRecoveryCapability } from '../../../../apps/api/src/modules/m1/application/use-cases/issue-recovery-capability.ts';
import { EnrollRecoveryFactor } from '../../../../apps/api/src/modules/m1/application/use-cases/enroll-recovery-factor.ts';
import { VerifyRecoveryFactor } from '../../../../apps/api/src/modules/m1/application/use-cases/verify-recovery-factor.ts';
import { ProcessMfaRecoveries } from '../../../../apps/api/src/modules/m1/application/use-cases/process-mfa-recoveries.ts';
import { LocalRecoverySecrets } from '../../../../apps/api/src/modules/m1/infrastructure/adapters/recovery-secrets.ts';
import {
  recoveryRequest,
  recoveryKey,
  recoveryCapability,
} from '../../../../apps/api/src/modules/m1/presentation/dtos/recovery-request.ts';
import { fail } from '../../../../apps/api/src/security.ts';
let now,
  rows,
  roles,
  sessions,
  audits,
  provider,
  context,
  requests,
  reads,
  reviews,
  capabilities,
  enrollments,
  verifications,
  worker,
  owner,
  reviewer,
  tail;
const current = (id) => structuredClone(rows.get(id));
beforeEach(() => {
  now = new Date('2026-10-14T12:00:00Z');
  rows = new Map();
  roles = new Map([
    ['owner', new Set(['m1_operator'])],
    ['reviewer', new Set(['m1_operator', 'm1_access_admin'])],
  ]);
  sessions = new Set(['owner-session', 'reviewer-session']);
  audits = [];
  tail = Promise.resolve();
  owner = {
    accountId: 'owner',
    authId: 'owner-auth',
    sessionId: 'owner-session',
    authenticatedAt: now,
    tokens: { access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_at: 0 },
  };
  reviewer = {
    ...owner,
    accountId: 'reviewer',
    authId: 'reviewer-auth',
    sessionId: 'reviewer-session',
  };
  const tx = {
    get: async (id) => (rows.has(id) ? current(id) : null),
    byRequest: async (accountId, key) =>
      [...rows.values()].find((r) => r.accountId === accountId && r.requestKey === key)
        ? structuredClone(
            [...rows.values()].find((r) => r.accountId === accountId && r.requestKey === key),
          )
        : null,
    active: async (accountId) => {
      const r = [...rows.values()].find(
        (r) =>
          r.accountId === accountId &&
          ['requested', 'approved', 'executing', 'provider_pending', 'reenrollment'].includes(
            r.state,
          ),
      );
      return r ? structuredClone(r) : null;
    },
    create: async (row) => {
      rows.set(row.id, structuredClone(row));
      return current(row.id);
    },
    save: async (row) => {
      if (rows.get(row.id).version !== row.version) fail(409, 'VERSION', 'Conflicto');
      rows.set(row.id, structuredClone({ ...row, version: row.version + 1 }));
      return current(row.id);
    },
    requiresRecovery: async (id) => {
      const latest = [...rows.values()]
        .filter((r) => r.accountId === id && r.approvedBy)
        .sort((a, b) => +b.createdAt - +a.createdAt)[0];
      return !!latest && latest.state !== 'completed';
    },
    hasRole: async (id, role) => roles.get(id)?.has(role) ?? false,
    sessionActive: async (id, session) => sessions.has(session) && session.startsWith(id),
    revoke: async (id) => {
      for (const s of sessions) if (s.startsWith(id)) sessions.delete(s);
    },
    audit: async (...args) => {
      audits.push(args);
    },
    operationKey: async (key, id) => {
      if ([...rows.values()].some((r) => r.id !== id && r.operations[key]))
        fail(409, 'IDEMPOTENCIA', 'Otro recurso');
    },
  };
  const repository = {
    atomic: (_key, fn) => {
      const work = tail.then(async () => {
        const snapshot = structuredClone(rows);
        const oldSessions = new Set(sessions);
        const count = audits.length;
        try {
          return await fn(tx);
        } catch (e) {
          rows = snapshot;
          sessions = oldSessions;
          audits.length = count;
          throw e;
        }
      });
      tail = work.catch(() => {});
      return work;
    },
    get: tx.get,
    pending: async () =>
      [...rows.values()]
        .filter((r) => ['approved', 'executing', 'provider_pending'].includes(r.state))
        .map((value) => structuredClone(value)),
    cleanups: async () =>
      [...rows.values()]
        .filter(
          (r) =>
            r.expiresAt <= now ||
            Object.values(r.operations).some(
              (op) => op.response && op.expiresAt && new Date(op.expiresAt) <= now,
            ),
        )
        .map((value) => structuredClone(value)),
  };
  provider = {
    assurance: vi.fn().mockResolvedValue('aal2'),
    factors: vi.fn().mockResolvedValue(['lost']),
    reset: vi.fn().mockResolvedValue(undefined),
    enroll: vi.fn().mockResolvedValue({
      factor_id: 'new-factor',
      uri: 'otpauth://totp/fixture?secret=FIXTURE',
      qr_code: 'fixture',
    }),
    verify: vi.fn().mockResolvedValue(undefined),
    verified: vi.fn().mockResolvedValue(false),
  };
  context = new RecoveryContext(repository, provider, new LocalRecoverySecrets(), () => now);
  requests = new RequestMfaRecovery(context);
  reads = new ReadMfaRecovery(context);
  reviews = new ReviewMfaRecovery(context);
  capabilities = new IssueRecoveryCapability(context);
  enrollments = new EnrollRecoveryFactor(context);
  verifications = new VerifyRecoveryFactor(context);
  worker = new ProcessMfaRecoveries(context);
});
async function requested() {
  return requests.execute(owner, 'Factor perdido', 'request-key');
}
function fresh() {
  now = new Date(+now + 10);
  owner = { ...owner, sessionId: 'owner-new-' + +now, authenticatedAt: now };
  sessions.add(owner.sessionId);
}
async function ready() {
  const r = await requested();
  await reviews.execute(reviewer, r.id, r.version, 'review-key', 'approve');
  await worker.execute();
  fresh();
  return current(r.id);
}
async function capable() {
  let r = await ready();
  const cap = await capabilities.execute(owner, r.id, r.version, 'cap-key');
  return { row: current(r.id), cap: cap.capability };
}
async function enrolled() {
  const { row, cap } = await capable();
  await enrollments.execute(owner, row.id, row.version, 'enroll-key', cap);
  return { row: current(row.id), cap };
}
it('UT114 solicitud repetida/concurrente y cuerpo distinto, no segundo proceso', async () => {
  const results = await Promise.all([requested(), requested()]);
  expect(results[0].id).toBe(results[1].id);
  expect(rows.size).toBe(1);
  await expect(requests.execute(owner, 'Otro', 'request-key')).rejects.toMatchObject({
    status: 409,
  });
  await expect(requests.execute(owner, 'Otro', 'another-key')).rejects.toMatchObject({
    status: 409,
  });
  provider.factors.mockRejectedValue(Error('Provider down'));
  expect((await requested()).id).toBe(results[0].id);
});
it('UT114 niega sin sesión/rol, autenticación vieja y factores ambiguos', async () => {
  sessions.clear();
  await expect(requested()).rejects.toMatchObject({ status: 401 });
  sessions.add(owner.sessionId);
  roles.get('owner').clear();
  await expect(requested()).rejects.toMatchObject({ status: 403 });
  roles.get('owner').add('m1_operator');
  owner.authenticatedAt = new Date(+now - 300000);
  await expect(requested()).rejects.toMatchObject({ status: 403 });
  owner.authenticatedAt = now;
  for (const ids of [[], ['one', 'two']]) {
    provider.factors.mockResolvedValue(ids);
    await expect(requested()).rejects.toMatchObject({ status: 409 });
  }
});
it('UT115 propia/sin admin/AAL1/vieja y versión antigua no aprueban ni revocan', async () => {
  const r = await requested();
  await expect(reviews.execute(owner, r.id, 1, 'self', 'approve')).rejects.toMatchObject({
    status: 403,
  });
  roles.get('reviewer').delete('m1_access_admin');
  await expect(reviews.execute(reviewer, r.id, 1, 'role', 'approve')).rejects.toMatchObject({
    status: 403,
  });
  roles.get('reviewer').add('m1_access_admin');
  provider.assurance.mockResolvedValue('aal1');
  await expect(reviews.execute(reviewer, r.id, 1, 'aal', 'approve')).rejects.toMatchObject({
    status: 403,
  });
  provider.assurance.mockResolvedValue('aal2');
  await expect(
    reviews.execute(
      { ...reviewer, authenticatedAt: new Date(+now - 300000) },
      r.id,
      1,
      'old',
      'approve',
    ),
  ).rejects.toMatchObject({ status: 403 });
  await expect(reviews.execute(reviewer, r.id, 99, 'version', 'approve')).rejects.toMatchObject({
    status: 409,
  });
  expect(sessions.has(owner.sessionId)).toBe(true);
});
it('UT115 aprobación repetida/concurrente revoca antes de proveedor; rechazo conserva motivo', async () => {
  const r = await requested();
  const both = await Promise.all([
    reviews.execute(reviewer, r.id, 1, 'same', 'approve'),
    reviews.execute(reviewer, r.id, 1, 'same', 'approve'),
  ]);
  expect(both[0]).toEqual(both[1]);
  expect(provider.reset).not.toHaveBeenCalled();
  expect(sessions.has(owner.sessionId)).toBe(false);
  expect(audits.filter((a) => a[1] === 'recovery.approve')).toHaveLength(1);
});
it('UT116 rechazo idempotente, conflicto de motivo y ausencia de efecto externo', async () => {
  const r = await requested();
  const rejected = await reviews.execute(
    reviewer,
    r.id,
    1,
    'reject',
    'reject',
    'Motivo de revisión',
  );
  expect(rejected.state).toBe('rejected');
  expect(
    await reviews.execute(reviewer, r.id, 1, 'reject', 'reject', 'Motivo de revisión'),
  ).toEqual(rejected);
  await expect(
    reviews.execute(reviewer, r.id, 1, 'reject', 'reject', 'Otro'),
  ).rejects.toMatchObject({ status: 409 });
  expect(Object.values(current(r.id).operations)[0].reason).toBe('Motivo de revisión');
  expect(provider.reset).not.toHaveBeenCalled();
});
it('UT116 consulta mínima, recurso ajeno/ausente y expiración no restituyen permisos', async () => {
  const r = await requested();
  expect(Object.keys(await reads.execute(owner, r.id))).toEqual(['id', 'state', 'version']);
  provider.assurance.mockResolvedValue('aal1');
  await expect(
    reads.execute({ ...owner, accountId: 'other', sessionId: 'other-session' }, r.id),
  ).rejects.toMatchObject({ status: 401 });
  await expect(reads.execute(owner, 'missing')).rejects.toMatchObject({ status: 404 });
  now = new Date(+now + 86400000);
  expect((await reads.execute(owner, r.id)).state).toBe('expired');
  expect(current(r.id).providerState).toEqual({});
});
it('UT117 caída conserva provider_pending; worker nuevo y OTP nuevo permiten continuar', async () => {
  const r = await requested();
  await reviews.execute(reviewer, r.id, 1, 'approve', 'approve');
  provider.reset.mockRejectedValueOnce(Error('down'));
  await worker.execute();
  expect(current(r.id).state).toBe('provider_pending');
  fresh();
  expect((await requests.execute(owner, 'Continuar', 'new-key')).id).toBe(r.id);
  await new ProcessMfaRecoveries(context).execute();
  expect(current(r.id).state).toBe('reenrollment');
  expect(sessions.has(owner.sessionId)).toBe(false);
});
it('UT117 lease vigente/viejo y estado posterior no se pisan', async () => {
  const r = await requested();
  await reviews.execute(reviewer, r.id, 1, 'approve', 'approve');
  const row = current(r.id);
  row.leaseToken = 'active';
  row.leaseUntil = new Date(+now + 180000);
  rows.set(r.id, row);
  await worker.execute();
  expect(provider.reset).not.toHaveBeenCalled();
  now = new Date(+now + 180001);
  provider.reset.mockImplementation(async () => {
    const latest = current(r.id);
    latest.leaseToken = 'new-worker';
    rows.set(r.id, latest);
  });
  await worker.execute();
  expect(current(r.id).leaseToken).toBe('new-worker');
  expect(current(r.id).state).toBe('executing');
});
it('UT118 capacidad exige OTP posterior, solo titular/sesión, no reemisión durante lease', async () => {
  const r = await ready();
  const old = { ...owner, authenticatedAt: r.approvedAt };
  await expect(capabilities.execute(old, r.id, r.version, 'old')).rejects.toMatchObject({
    status: 403,
  });
  const cap = await capabilities.execute(owner, r.id, r.version, 'cap');
  expect(await capabilities.execute(owner, r.id, r.version, 'cap')).toEqual(cap);
  await expect(
    enrollments.execute(reviewer, r.id, current(r.id).version, 'foreign', cap.capability),
  ).rejects.toMatchObject({ status: 404 });
  const locked = current(r.id);
  locked.leaseToken = 'lease';
  locked.leaseUntil = new Date(+now + 180000);
  rows.set(r.id, locked);
  await expect(capabilities.execute(owner, r.id, locked.version, 'another')).rejects.toMatchObject({
    status: 409,
  });
});
it('UT118 vencida/usada/sesión ajena no llama proveedor; no secreto en persistencia', async () => {
  const { row, cap } = await capable();
  expect(JSON.stringify(current(row.id))).not.toContain(cap);
  fresh();
  await expect(
    enrollments.execute(owner, row.id, row.version, 'another-session', cap),
  ).rejects.toMatchObject({ status: 403 });
  expect(provider.enroll).not.toHaveBeenCalled();
});
it('UT119 enrolamiento repetido no duplica factor; caída libera lease y permite reintento seguro', async () => {
  const { row, cap } = await capable();
  provider.enroll.mockRejectedValueOnce(Error('uncertain'));
  await expect(enrollments.execute(owner, row.id, row.version, 'enroll', cap)).rejects.toThrow(
    'uncertain',
  );
  expect(current(row.id).leaseToken).toBeNull();
  const factor = await enrollments.execute(owner, row.id, row.version, 'enroll', cap);
  expect(await enrollments.execute(owner, row.id, row.version, 'enroll', cap)).toEqual(factor);
  expect(provider.enroll).toHaveBeenCalledTimes(2);
});
it('UT119 respuesta tardía con lease cambiado no guarda factor ni QR', async () => {
  const { row, cap } = await capable();
  provider.enroll.mockImplementation(async () => {
    const latest = current(row.id);
    latest.leaseToken = 'other';
    rows.set(row.id, latest);
    return { factor_id: 'new', uri: 'private', qr_code: 'private' };
  });
  await expect(enrollments.execute(owner, row.id, row.version, 'late', cap)).rejects.toMatchObject({
    status: 409,
  });
  expect(current(row.id).factorId).toBeNull();
});
it('UT120 factor ajeno y cinco códigos erróneos invalidan capacidad; misma clave no consume otra vez', async () => {
  const { row, cap } = await enrolled();
  provider.verify.mockImplementation(async () => fail(401, 'FACTOR', 'Incorrecto'));
  await expect(
    verifications.execute(owner, row.id, row.version, 'foreign', cap, 'other', '000000'),
  ).rejects.toMatchObject({ status: 403 });
  for (let i = 0; i < 5; i++) {
    const version = current(row.id).version;
    await expect(
      verifications.execute(owner, row.id, version, 'wrong-' + i, cap, row.factorId, '000000'),
    ).rejects.toMatchObject({ status: 401 });
    if (i === 0)
      await expect(
        verifications.execute(owner, row.id, version, 'wrong-' + i, cap, row.factorId, '000000'),
      ).rejects.toMatchObject({ status: 401 });
  }
  expect(provider.verify).toHaveBeenCalledTimes(5);
  expect(current(row.id).capabilityConsumedAt).not.toBeNull();
  await expect(
    capabilities.execute(owner, row.id, current(row.id).version, 'fresh'),
  ).rejects.toMatchObject({ status: 403 });
  fresh();
  expect(
    (await capabilities.execute(owner, row.id, current(row.id).version, 'fresh')).capability,
  ).toBeTruthy();
});
it('UT120 fallo temporal no consume código, reintento concilia y completa una sola vez', async () => {
  const { row, cap } = await enrolled();
  provider.verify.mockRejectedValueOnce(Error('provider uncertain'));
  await expect(
    verifications.execute(owner, row.id, row.version, 'verify', cap, row.factorId, '123456'),
  ).rejects.toThrow('uncertain');
  expect(current(row.id).capabilityAttempts).toBe(0);
  const complete = await verifications.execute(
    owner,
    row.id,
    row.version,
    'verify',
    cap,
    row.factorId,
    '123456',
  );
  expect(complete.state).toBe('completed');
  expect(sessions.has(owner.sessionId)).toBe(false);
  expect(current(row.id).providerState).toEqual({});
  expect(audits.filter((a) => a[1] === 'recovery.completed')).toHaveLength(1);
});
it('UT121 expiración/limpieza y clave reutilizada en otro recurso no reviven acceso', async () => {
  const { row, cap } = await capable();
  now = new Date(+now + 600001);
  await worker.execute();
  expect(
    Object.values(current(row.id).operations)
      .filter((op) => op.expiresAt)
      .every((op) => !op.response),
  ).toBe(true);
  await expect(
    enrollments.execute(owner, row.id, current(row.id).version, 'expired', cap),
  ).rejects.toMatchObject({ status: 403 });
  now = new Date(+now + 86400000);
  await worker.execute();
  expect(current(row.id).state).toBe('expired');
  expect(current(row.id).providerState).toEqual({});
});
it('UT121 validación frontera rechaza campos, clave/capacidad y códigos mal formados', () => {
  for (const body of [null, [], {}, { reason: '' }, { reason: 'x', role: 'admin' }])
    expect(() => recoveryRequest(body, 'request')).toThrow();
  for (const version of [0, 1.5, '1'])
    expect(() => recoveryRequest({ expected_version: version }, 'version')).toThrow();
  expect(recoveryRequest({ reason: 'Ficticio' }, 'request').reason).toBe('Ficticio');
  expect(recoveryRequest({ expected_version: 1 }, 'version').version).toBe(1);
  expect(() =>
    recoveryRequest({ expected_version: 1, factor_id: 'invalid', codigo: '123' }, 'verify'),
  ).toThrow();
  for (const key of ['', null, 'x'.repeat(129), 'newline\n'])
    expect(() => recoveryKey(key)).toThrow();
  expect(recoveryKey('key')).toBe('key');
  expect(() => recoveryCapability('invalid')).toThrow();
  expect(recoveryCapability('a'.repeat(43))).toBe('a'.repeat(43));
});
