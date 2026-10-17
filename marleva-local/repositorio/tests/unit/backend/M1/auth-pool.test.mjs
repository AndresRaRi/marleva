import { it, expect } from 'vitest';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  authPoolEnv,
  assertAuthTarget,
  appliedAuthPool,
  configureAuthPool,
} from '../../../../scripts/configure-auth-pool.mjs';
function fixture(overrides = {}) {
  const context = {
    project: 'marleva-ci',
    folder: mkdtempSync(path.join(os.tmpdir(), 'marleva-auth-pool-')),
  };
  const container = {
    Name: '/supabase_auth_marleva-ci',
    Config: {
      WorkingDir: '/',
      Labels: {
        'com.supabase.cli.project': context.project,
        'com.supabase.cli.workdir': context.folder,
      },
    },
    State: { Running: true },
  };
  const calls = [];
  const run = (args) => {
    calls.push(args);
    if (args[0] === 'inspect') return JSON.stringify([overrides.container ?? container]);
    if (args[0] === 'logs')
      return (
        overrides.log ??
        JSON.stringify({
          limit_strategy: 'fixed',
          limit_max_open_conns: 20,
          limit_max_idle_conns: 20,
        })
      );
    if (args.includes('sh')) return overrides.previous ?? '';
    if (args.includes('wget')) return '{"version":"v2.197.0"}';
    return '';
  };
  return { context, container, calls, run };
}
it('AUTH-POOL-001 | contenedor/ruta/propietario ajenos bloquean antes de configurar', async () => {
  const f = fixture();
  for (const other of [
    { ...f.context, project: 'production' },
    { ...f.context, folder: '/private/tmp/other' },
    { ...f.context, folder: 'relative' },
  ])
    expect(() => assertAuthTarget(f.container, other)).toThrow();
  const wrong = fixture({ container: { ...f.container, Name: '/supabase_auth_marleva-m1' } });
  await expect(configureAuthPool(wrong.context, wrong.run)).rejects.toThrow();
  expect(wrong.calls.map((c) => c[0])).toEqual(['inspect']);
});
it('AUTH-POOL-002 | configuración anterior ajena se conserva sin copiar/reiniciar', async () => {
  const f = fixture({ previous: 'FOREIGN_SETTING=private-value\n' });
  await expect(configureAuthPool(f.context, f.run)).rejects.toThrow('no sobrescribir');
  expect(f.calls.some((c) => ['cp', 'restart'].includes(c[0]))).toBe(false);
});
it('AUTH-POOL-003 | prepara configuración oficial y confirma límites reales', async () => {
  for (const previous of ['', authPoolEnv]) {
    const f = fixture({ previous });
    await expect(configureAuthPool(f.context, f.run)).resolves.toEqual({
      maxOpen: 20,
      maxIdle: 20,
      verified: true,
    });
    expect(f.calls.filter((c) => c[0] === 'restart')).toEqual([
      ['restart', '--time', '10', 'supabase_auth_marleva-ci'],
    ]);
    expect(f.calls.some((c) => c[0] === 'cp' && c[2] === 'supabase_auth_marleva-ci:/.env')).toBe(
      true,
    );
    expect(f.calls.some((c) => ['rm', 'stop', 'kill'].includes(c[0]))).toBe(false);
  }
});
it('AUTH-POOL-004 | pool no aplicado o evidencia ausente impiden continuar', async () => {
  const wrong = fixture({
    log: JSON.stringify({
      limit_strategy: 'fixed',
      limit_max_open_conns: 0,
      limit_max_idle_conns: 0,
    }),
  });
  await expect(configureAuthPool(wrong.context, wrong.run)).rejects.toThrow('pool requerido');
  const missing = fixture({ log: '' });
  let retries = 0;
  await expect(
    configureAuthPool(missing.context, missing.run, async () => {
      retries++;
    }),
  ).rejects.toThrow('No se confirmó');
  expect(retries).toBe(50);
});
it('AUTH-POOL-005 | solo límites numéricos de la última aplicación, nunca secretos', () => {
  const log = [
    JSON.stringify({ limit_strategy: 'fixed', limit_max_open_conns: 20, limit_max_idle_conns: 20 }),
    JSON.stringify({
      limit_strategy: 'fixed',
      limit_max_open_conns: 'private-key',
      limit_max_idle_conns: -1,
      other: 'secret',
    }),
  ].join('\n');
  expect(appliedAuthPool(log)).toEqual({ maxOpen: null, maxIdle: null });
  expect(appliedAuthPool('private text')).toBeUndefined();
});
