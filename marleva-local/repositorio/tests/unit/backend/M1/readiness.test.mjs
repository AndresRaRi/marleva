import { it, expect, vi, beforeEach, afterEach } from 'vitest';
const mocks = vi.hoisted(() => ({ query: vi.fn(), close: vi.fn(), database: vi.fn() }));
vi.mock('../../../../apps/api/src/config.js', () => ({
  config: () => ({
    SUPABASE_URL: 'http://127.0.0.1',
    SUPABASE_ANON_KEY: 'private-fixture',
    MAILPIT_URL: 'http://localhost',
  }),
}));
vi.mock('../../../../apps/api/src/database.js', () => ({ database: mocks.database }));
import { readiness } from '../../../../apps/api/src/readiness';
import { assertReadinessTarget } from '../../../fixtures/readiness-target.mjs';
beforeEach(() => {
  vi.resetAllMocks();
  mocks.query.mockResolvedValue([{ value: 1 }]);
  mocks.close.mockResolvedValue(undefined);
  mocks.database.mockReturnValue({ $queryRaw: mocks.query, $disconnect: mocks.close });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});
afterEach(() => vi.unstubAllGlobals());
it('MAR-M1-UT-BE-110-READY | dependencias sanas y espera PG acotada', async () => {
  await expect(readiness()).resolves.toEqual({
    status: 'ready',
    mode: 'local',
    payment: 'simulated',
  });
  expect(mocks.database).toHaveBeenCalledWith({
    connectionTimeoutMillis: 3000,
    query_timeout: 3000,
  });
  expect(mocks.close).toHaveBeenCalledOnce();
  expect(fetch).toHaveBeenCalledTimes(3);
});
async function unavailable() {
  try {
    await readiness();
    throw new Error('Se esperaba rechazo');
  } catch (error) {
    expect(error.getStatus()).toBe(503);
    expect(error.getResponse()).toMatchObject({ codigo: 'DEPENDENCIA' });
    expect(JSON.stringify(error.getResponse())).not.toMatch(/private|password|postgresql/);
  }
  expect(mocks.close).toHaveBeenCalledOnce();
}
it('MAR-M1-UT-BE-110-PG | conexión o consulta PG fallida cierra y devuelve 503', async () => {
  mocks.query.mockRejectedValue(new Error('postgresql://private:password@localhost'));
  await unavailable();
  expect(fetch).not.toHaveBeenCalled();
});
it.each(['auth', 'storage', 'mail'])(
  'MAR-M1-UT-BE-110-%s | HTTP rechazado conserva error recuperable',
  async (service) => {
    fetch.mockImplementation(async (url) => ({
      ok: !url.includes({ auth: '/auth/', storage: '/storage/', mail: '/api/' }[service]),
    }));
    await unavailable();
  },
);
it.each(['connection refused', 'TimeoutError'])(
  'MAR-M1-UT-BE-110-TRANSPORT | %s no escapa como 500',
  async (message) => {
    fetch.mockRejectedValue(new Error(message + ': private-fixture'));
    await unavailable();
  },
);
it('MAR-M1-UT-BE-110-CLOSE | fallo al cerrar tampoco divulga detalles ni responde ready', async () => {
  mocks.close.mockRejectedValue(new Error('private-fixture'));
  await unavailable();
});
it('MAR-M1-UT-BE-110-TARGET | ensayo rechaza otro proyecto, ruta, nombre o servicio', () => {
  const folder = '/private/tmp/marleva-ci';
  const row = {
    Name: '/supabase_db_marleva-ci',
    Config: {
      Labels: { 'com.supabase.cli.project': 'marleva-ci', 'com.supabase.cli.workdir': folder },
    },
    State: { Running: true },
  };
  expect(() => assertReadinessTarget(row, 'db', folder)).not.toThrow();
  for (const [target, service, location] of [
    [row, 'db', '/private/tmp/other'],
    [row, 'db', 'relative'],
    [row, 'unknown', folder],
    [{ ...row, Name: '/supabase_db_marleva-m1' }, 'db', folder],
    [
      {
        ...row,
        Config: { Labels: { ...row.Config.Labels, 'com.supabase.cli.project': 'marleva-m1' } },
      },
      'db',
      folder,
    ],
    [{ ...row, State: { Running: false } }, 'db', folder],
  ])
    expect(() => assertReadinessTarget(target, service, location)).toThrow();
});
