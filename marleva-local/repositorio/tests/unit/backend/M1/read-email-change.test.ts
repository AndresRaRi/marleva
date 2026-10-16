import { it, expect, vi } from 'vitest';
import { ReadEmailChange } from '../../../../apps/api/src/modules/m1/application/use-cases/read-email-change';
import { emailChangeStatus } from '../../../../apps/api/src/modules/m1/domain/email-change-status';
const now = new Date('2026-10-15T18:00:00Z');
const snapshot = {
  id: 'change',
  accountId: 'a',
  oldEmail: 'a@example.test',
  newEmail: 'new@example.test',
  oldConfirmed: true,
  newConfirmed: false,
  state: 'open',
  expiresAt: new Date(now.getTime() + 60000),
  providerTokens: 'not-exposed',
};
it('MAR-M1-UT-BE-109-A | recupera solo estado propio sin tokens ni códigos', async () => {
  const latest = vi.fn().mockResolvedValue(snapshot);
  const result = await new ReadEmailChange({ latest }, () => now).execute('a');
  expect(latest).toHaveBeenCalledWith('a');
  expect(result.cambio).toMatchObject({
    account_id: 'a',
    actual_confirmado: true,
    nuevo_confirmado: false,
    estado: 'verificar_ambos_buzones',
  });
  expect(Object.keys(result.cambio!).sort()).toEqual(
    [
      'id',
      'account_id',
      'correo_actual',
      'correo_nuevo',
      'actual_confirmado',
      'nuevo_confirmado',
      'estado',
      'vence_en',
    ].sort(),
  );
});
it('MAR-M1-UT-BE-109-B | sin cambio confirmado es null, no error', async () => {
  expect(await new ReadEmailChange({ latest: async () => null }).execute('a')).toEqual({
    cambio: null,
  });
});
it('MAR-M1-UT-BE-109-C | lector con cuenta ajena no entrega datos', async () => {
  await expect(new ReadEmailChange({ latest: async () => snapshot }).execute('b')).rejects.toThrow(
    'ajena',
  );
});
it.each([
  ['open', 'vencido'],
  ['sending', 'vencido'],
  ['verifying', 'vencido'],
  ['reconcile', 'conciliando'],
  ['complete', 'completo'],
  ['failed', 'fallido'],
])('MAR-M1-UT-BE-109-D | vencimiento de %s no falsea %s', (state, expected) => {
  expect(emailChangeStatus(state, now, now)).toBe(expected);
});
it('MAR-M1-UT-BE-109-E | estados no reconocidos no aparentan borrador válido', () => {
  for (const state of ['unknown', 'toString', '__proto__'])
    expect(() => emailChangeStatus(state, now, now)).toThrow();
});
