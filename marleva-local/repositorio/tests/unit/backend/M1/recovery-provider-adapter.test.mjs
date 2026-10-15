import { beforeEach, it, expect, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ auth: {}, admin: {} }));
vi.mock('../../../../apps/api/src/identity.ts', () => ({
  identity: () => ({ auth: fixture.auth }),
  authenticatedIdentity: async () => ({ client: { auth: fixture.auth } }),
  identityAdmin: () => ({ auth: { admin: fixture.admin } }),
}));
import { SupabaseRecoveryProvider } from '../../../../apps/api/src/modules/m1/infrastructure/adapters/supabase-recovery-provider.ts';
const tokens = { access_token: 'fixture', refresh_token: 'fixture', expires_at: 1 };
beforeEach(() => {
  fixture.auth.setSession = vi.fn().mockResolvedValue({
    data: { session: { access_token: 'fixture' }, user: { id: 'owner' } },
    error: null,
  });
  fixture.auth.refreshSession = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: 'owner' } }, error: null });
  fixture.auth.mfa = {
    getAuthenticatorAssuranceLevel: vi
      .fn()
      .mockResolvedValue({ data: { currentLevel: 'aal2' }, error: null }),
    enroll: vi.fn().mockResolvedValue({
      data: { id: 'new', totp: { uri: 'fixture', qr_code: 'fixture' } },
      error: null,
    }),
    challengeAndVerify: vi.fn().mockResolvedValue({ data: {}, error: null }),
  };
  fixture.admin.signOut = vi.fn().mockResolvedValue({ error: null });
  fixture.admin.mfa = {
    listFactors: vi.fn().mockResolvedValue({ data: { factors: [] }, error: null }),
    deleteFactor: vi.fn().mockResolvedValue({ error: null }),
  };
});
it('Proveedor: nivel y filtro excluyen factores ajenos al TOTP verificado', async () => {
  const provider = new SupabaseRecoveryProvider();
  expect(await provider.assurance(tokens)).toBe('aal2');
  fixture.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce({
    data: { currentLevel: 'aal1' },
    error: null,
  });
  expect(await provider.assurance(tokens)).toBe('aal1');
  fixture.admin.mfa.listFactors.mockResolvedValue({
    data: {
      factors: [
        { id: 'old', status: 'verified', factor_type: 'totp' },
        { id: 'pending', status: 'unverified', factor_type: 'totp' },
      ],
    },
    error: null,
  });
  expect(await provider.factors('owner')).toEqual(['old']);
});
it.each(['assurance', 'list'])('Proveedor no acredita respuesta fallida: %s', async (kind) => {
  const provider = new SupabaseRecoveryProvider();
  if (kind === 'assurance')
    fixture.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: null,
      error: new Error('fixture'),
    });
  else fixture.admin.mfa.listFactors.mockResolvedValue({ data: null, error: new Error('fixture') });
  await expect(
    kind === 'assurance' ? provider.assurance(tokens) : provider.factors('owner'),
  ).rejects.toThrow();
});
it('Reset elimina solo los factores designados y confirma ausencia', async () => {
  fixture.admin.mfa.listFactors.mockResolvedValueOnce({
    data: { factors: [{ id: 'old' }, { id: 'other' }] },
    error: null,
  });
  await new SupabaseRecoveryProvider().reset('owner', ['old'], tokens);
  expect(fixture.admin.mfa.deleteFactor).toHaveBeenCalledExactlyOnceWith({
    userId: 'owner',
    id: 'old',
  });
});
it.each(['session', 'logout', 'delete', 'remaining'])(
  'Reset conserva fallo recuperable: %s',
  async (kind) => {
    if (kind === 'session')
      fixture.auth.setSession.mockResolvedValue({ error: new Error('fixture'), data: {} });
    if (kind === 'logout') fixture.admin.signOut.mockResolvedValue({ error: new Error('fixture') });
    if (['delete', 'remaining'].includes(kind))
      fixture.admin.mfa.listFactors.mockResolvedValue({
        data: { factors: [{ id: 'old' }] },
        error: null,
      });
    if (kind === 'delete')
      fixture.admin.mfa.deleteFactor.mockResolvedValue({ error: new Error('fixture') });
    await expect(new SupabaseRecoveryProvider().reset('owner', ['old'], tokens)).rejects.toThrow();
  },
);
it.each(['unverified', 'verified', 'delete-failed', 'enroll-failed'])(
  'Enrolamiento concilia respuesta incierta: %s',
  async (kind) => {
    const factor = {
      id: 'pending',
      friendly_name: 'recovery-process',
      status: kind === 'verified' ? 'verified' : 'unverified',
    };
    fixture.admin.mfa.listFactors.mockResolvedValue({
      data: { factors: [factor, { id: 'other', friendly_name: 'other' }] },
      error: null,
    });
    if (kind === 'delete-failed')
      fixture.admin.mfa.deleteFactor.mockResolvedValue({ error: new Error('fixture') });
    if (kind === 'enroll-failed')
      fixture.auth.mfa.enroll.mockResolvedValue({ data: null, error: new Error('fixture') });
    const work = new SupabaseRecoveryProvider().enroll('owner', 'process', tokens);
    if (kind === 'unverified') await expect(work).resolves.toMatchObject({ factor_id: 'new' });
    else await expect(work).rejects.toThrow();
  },
);
it.each(['current', 'replay', 'wrong', 'level', 'refresh-failed'])(
  'Verificación exige código o conciliación AAL2: %s',
  async (kind) => {
    const provider = new SupabaseRecoveryProvider();
    if (['replay', 'refresh-failed'].includes(kind))
      fixture.admin.mfa.listFactors.mockResolvedValue({
        data: { factors: [{ id: 'factor', status: 'verified' }] },
        error: null,
      });
    if (kind === 'wrong')
      fixture.auth.mfa.challengeAndVerify.mockResolvedValue({
        data: null,
        error: new Error('fixture'),
      });
    if (kind === 'level')
      fixture.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
        data: { currentLevel: 'aal1' },
        error: null,
      });
    if (kind === 'refresh-failed')
      fixture.auth.refreshSession.mockResolvedValue({ data: {}, error: new Error('fixture') });
    const work = provider.verify(
      'owner',
      'factor',
      '123456',
      tokens,
      ['replay', 'refresh-failed'].includes(kind),
    );
    if (['wrong', 'level'].includes(kind)) await expect(work).rejects.toThrow();
    else await expect(work).resolves.toBeUndefined();
    if (kind === 'replay') expect(fixture.auth.mfa.challengeAndVerify).not.toHaveBeenCalled();
  },
);
