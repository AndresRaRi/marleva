import { it, expect, vi } from 'vitest';
import { AuthorizeRecoveryReview } from '../../../../apps/api/src/modules/m1/application/use-cases/authorize-recovery-review.ts';
it('MAR-M1-UT-BE-114-A | revisión propia, permiso, AAL y tiempo; sin efectos externos', async () => {
  const clock = new Date('2026-10-14T12:00:00Z');
  const permissions = {
    accessAdmin: vi.fn().mockResolvedValue(true),
    assurance: vi.fn().mockResolvedValue('aal2'),
  };
  const useCase = new AuthorizeRecoveryReview(permissions, () => clock);
  const actor = { accountId: 'reviewer', sessionId: 'session', authenticatedAt: clock };
  await expect(useCase.execute(actor, 'owner')).resolves.toBeUndefined();
  await expect(useCase.execute(actor, 'reviewer')).rejects.toMatchObject({
    response: { codigo: 'RECUPERACION_PROPIA' },
  });
  for (const time of [+clock - 300000, +clock + 1, NaN])
    await expect(
      useCase.execute({ ...actor, authenticatedAt: new Date(time) }, 'owner'),
    ).rejects.toMatchObject({ response: { codigo: 'REAUTENTICACION' } });
  permissions.accessAdmin.mockResolvedValue(false);
  await expect(useCase.execute(actor, 'owner')).rejects.toMatchObject({
    response: { codigo: 'PERMISO' },
  });
  permissions.accessAdmin.mockResolvedValue(true);
  permissions.assurance.mockResolvedValue('aal1');
  await expect(useCase.execute(actor, 'owner')).rejects.toMatchObject({
    response: { codigo: 'MFA' },
  });
  permissions.accessAdmin.mockRejectedValue(Error('DB down'));
  await expect(useCase.execute(actor, 'owner')).rejects.toThrow('DB down');
});
