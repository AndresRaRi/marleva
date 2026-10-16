import { it, expect } from 'vitest';
import { recoveryContext } from '../../../fixtures/recovery-context.mjs';
import { assertRecoveryCopy, recoveryNames } from '../../../fixtures/recovery-guard.mjs';
it('UT113-CONTEXT | etapas comparten dataset/ledger/reportes por ejecución, sin rutas arbitrarias', () => {
  const run = '1792005044662';
  const context = recoveryContext({
    MARLEVA_RECOVERY_RUN: run,
    MARLEVA_STACK_CONTEXT: 'b12-source-006',
  });
  for (const value of [context.fixture, context.ledger, context.keys, context.report('copy')])
    expect(value).toContain(run);
  expect(context.sourceApi).toBe('http://127.0.0.1:3106');
  expect(() => recoveryContext({ MARLEVA_RECOVERY_RUN: run })).toThrow();
  for (const invalid of ['../', '123', 'production'])
    expect(() =>
      recoveryContext({ MARLEVA_RECOVERY_RUN: invalid, MARLEVA_STACK_CONTEXT: 'b12-source-006' }),
    ).toThrow();
  expect(recoveryContext({}).report('copy')).toBe('tests/results/recovery-copy.json');
});
it('UT113-CONTEXT | copia aislada rechaza volúmenes del desarrollo y parejas cruzadas', () => {
  const names = recoveryNames('1792005044662');
  const volumes = {
    supabase_db_marleva_m1: 'supabase_db_marleva-b12-source-006',
    supabase_storage_marleva_m1: 'supabase_storage_marleva-b12-source-006',
  };
  expect(() =>
    assertRecoveryCopy(volumes.supabase_db_marleva_m1, names.pgBackup, names, volumes),
  ).not.toThrow();
  expect(() =>
    assertRecoveryCopy('supabase_db_marleva-m1', names.pgBackup, names, volumes),
  ).toThrow();
  expect(() =>
    assertRecoveryCopy(volumes.supabase_db_marleva_m1, names.storageBackup, names, volumes),
  ).toThrow();
  expect(() =>
    assertRecoveryCopy(names.pgBackup, volumes.supabase_db_marleva_m1, names, volumes),
  ).toThrow();
});
