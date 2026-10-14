import { it, expect, vi, beforeEach, afterEach } from 'vitest';
const mocks = vi.hoisted(() => ({
  platform: { OS: 'web' },
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('../../../../apps/client/node_modules/react-native', () => ({ Platform: mocks.platform }));
vi.mock('../../../../apps/client/node_modules/expo-secure-store', () => ({
  getItemAsync: mocks.get,
  setItemAsync: mocks.set,
  deleteItemAsync: mocks.remove,
}));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.platform.OS = 'web';
});
afterEach(() => vi.unstubAllGlobals());
it('MAR-M1-UT-FE-001 | SEQ003:S010 | web usa cookie y no credencial móvil', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ estado: 'active' }) });
  vi.stubGlobal('fetch', fetch);
  const { api } = await import('../../../../apps/client/src/api');
  await api('/v1/me');
  expect(fetch.mock.calls[0][1].credentials).toBe('include');
  expect(mocks.get).not.toHaveBeenCalled();
});
it('MAR-M1-UT-FE-002 | SEQ003:S030 | 401 móvil elimina la credencial almacenada', async () => {
  mocks.platform.OS = 'android';
  mocks.get.mockResolvedValue('fixture-opaque-token');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ codigo: 'SESION', mensaje: 'Inicia sesión' }),
    }),
  );
  const { api } = await import('../../../../apps/client/src/api');
  await expect(api('/v1/me')).rejects.toMatchObject({ status: 401 });
  expect(mocks.remove).toHaveBeenCalledWith('marleva_session');
});
it('MAR-M1-UT-FE-003 | SEQ002:S100 | credencial móvil se guarda en SecureStore', async () => {
  mocks.platform.OS = 'android';
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ session_token: 'fixture-opaque-token' }),
    }),
  );
  const { api } = await import('../../../../apps/client/src/api');
  await api('/v1/auth/verifications', 'POST', { challenge_id: 'fixture', codigo: '123456' });
  expect(mocks.set).toHaveBeenCalledWith('marleva_session', 'fixture-opaque-token');
});
it('MAR-M1-UT-FE-004 | SEQ010:S050 | fallo de red produce recuperación y no salida silenciosa', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  const { api } = await import('../../../../apps/client/src/api');
  await expect(api('/v1/me')).rejects.toThrow('Conservamos este paso');
});
it('MAR-M1-UT-FE-005 | SEQ010:S050 | respuesta inválida conserva credencial y muestra recuperación', async () => {
  mocks.platform.OS = 'android';
  mocks.get.mockResolvedValue('fixture-opaque-token');
  const fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => null })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError('invalid JSON');
      },
    });
  vi.stubGlobal('fetch', fetch);
  const { api } = await import('../../../../apps/client/src/api');
  await expect(api('/v1/me')).rejects.toThrow('Conservamos este paso');
  await expect(api('/v1/me')).rejects.toThrow('Conservamos este paso');
  expect(mocks.set).not.toHaveBeenCalled();
  expect(mocks.remove).not.toHaveBeenCalled();
});
it('MAR-M1-UT-FE-006 | SEQ003:S010 | recurso denegado403 no elimina sesión válida', async () => {
  mocks.platform.OS = 'android';
  mocks.get.mockResolvedValue('fixture-opaque-token');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ codigo: 'PERMISO', mensaje: 'Acceso no permitido' }),
    }),
  );
  const { api } = await import('../../../../apps/client/src/api');
  await expect(api('/v1/operator/access')).rejects.toMatchObject({ status: 403, code: 'PERMISO' });
  expect(mocks.remove).not.toHaveBeenCalled();
});
