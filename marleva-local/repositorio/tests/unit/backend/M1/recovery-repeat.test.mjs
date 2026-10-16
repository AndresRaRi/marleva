import { it, expect } from 'vitest';
import { assertRecoveryRepeat, recoveryNames } from '../../../fixtures/recovery-guard.mjs';
it('reutiliza solo backups inmutables y deriva destino nuevo', () => {
  const old = recoveryNames('1792118849918'),
    next = recoveryNames('1792168000000');
  expect(assertRecoveryRepeat('1792118849918', '1792168000000')).toEqual({
    ...next,
    pgBackup: old.pgBackup,
    storageBackup: old.storageBackup,
  });
});
it.each([
  ['1792118849918', '1792118849918'],
  ['../escape', '1792168000000'],
  ['1792118849918', 'local'],
  [undefined, '1792168000000'],
])('rechaza runs inseguros %s %s', (a, b) => {
  expect(() => assertRecoveryRepeat(a, b)).toThrow();
});
