import { it, expect } from 'vitest';
import {
  recoveryNames,
  assertRecoverySource,
  assertRecoveryCopy,
  assertRecoveryManifest,
} from '../../../fixtures/recovery-guard.mjs';
const names = recoveryNames('1791990000000');
it('MAR-M1-UT-BE-113-A | SEQ013:S001 | destino distinto y nombres cerrados', () => {
  expect(() => recoveryNames('../origen')).toThrow();
  expect(() => assertRecoveryCopy('supabase_db_marleva-m1', names.pgBackup, names)).not.toThrow();
  expect(() => assertRecoveryCopy(names.pgBackup, 'supabase_db_marleva-m1', names)).toThrow();
  expect(() => assertRecoveryCopy(names.pgBackup, names.pgBackup, names)).toThrow();
  expect(() => assertRecoveryCopy('volumen-desconocido', names.pgTarget, names)).toThrow();
  expect(() => assertRecoveryCopy('supabase_db_marleva-m1', names.storageBackup, names)).toThrow();
});
it('MAR-M1-UT-BE-113-B | SEQ013:S001 | montajes y red del origen se comprueban', () => {
  const source = {
    Name: '/supabase_db_marleva-m1',
    Image: 'sha256:' + 'a'.repeat(64),
    Mounts: [
      { Type: 'volume', Name: 'supabase_db_marleva-m1', Destination: '/var/lib/postgresql/data' },
    ],
    NetworkSettings: { Networks: { 'marleva-private': {} } },
  };
  const validate = (x) =>
    assertRecoverySource(
      x,
      'supabase_db_marleva-m1',
      'supabase_db_marleva-m1',
      '/var/lib/postgresql/data',
    );
  expect(() => validate(source)).not.toThrow();
  expect(() => validate({ ...source, Mounts: [...source.Mounts, { Type: 'bind' }] })).toThrow();
  expect(() => validate({ ...source, Name: '/otro' })).toThrow();
});
it('MAR-M1-UT-BE-113-C | SEQ013:S050 | falta de objeto o hash distinto bloquea destino', () => {
  const manifest = [{ bytes: 5, sha256: 'a'.repeat(64) }];
  expect(() => assertRecoveryManifest(manifest, manifest)).not.toThrow();
  expect(() => assertRecoveryManifest(manifest, [])).toThrow();
  expect(() => assertRecoveryManifest(manifest, [{ bytes: 5, sha256: 'b'.repeat(64) }])).toThrow();
});
