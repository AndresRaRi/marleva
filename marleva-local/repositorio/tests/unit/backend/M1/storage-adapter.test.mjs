import { it, expect, vi, afterEach } from 'vitest';
vi.mock('../../../../apps/api/src/config.ts', () => ({
  config: () => ({ SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_SERVICE_KEY: 'fixture' }),
}));
import { LocalPrivateStorage } from '../../../../apps/api/src/modules/m1/infrastructure/adapters/local-private-storage.ts';
afterEach(() => vi.unstubAllGlobals());
it.each([
  [404, '', true],
  [400, JSON.stringify({ code: 'NoSuchKey', statusCode: '404' }), true],
  [200, 'fixture', false],
])('Storage ausencia inequívoca %i', async (status, body, expected) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status })));
  expect(await new LocalPrivateStorage().absent('owner/file')).toBe(expected);
});
it.each([
  [400, '{}'],
  [400, 'invalid'],
  [500, ''],
])('Storage no interpreta fallo %i como borrado', async (status, body) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status })));
  await expect(new LocalPrivateStorage().absent('owner/file')).rejects.toThrow();
});
it('Storage conserva bytes y MIME de lectura limitada', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response('fixture', { headers: { 'content-type': 'text/plain; charset=utf-8' } }),
      ),
  );
  const result = await new LocalPrivateStorage().read('owner/file');
  expect(result.data.toString()).toBe('fixture');
  expect(result.mime).toBe('text/plain');
});
it.each(['status', 'size', 'stream', 'network'])(
  'Storage lectura falla de forma controlada: %s',
  async (kind) => {
    let response = new Response('fixture');
    if (kind === 'status') response = new Response('', { status: 500 });
    if (kind === 'size') response = new Response(new Uint8Array(1048577));
    if (kind === 'stream')
      response = new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new Error('fixture'));
          },
        }),
      );
    const fetch = vi.fn().mockResolvedValue(response);
    if (kind === 'network') fetch.mockRejectedValue(new Error('fixture'));
    vi.stubGlobal('fetch', fetch);
    await expect(new LocalPrivateStorage().read('owner/file')).rejects.toThrow();
  },
);
it.each([200, 500])('Storage borrado confirma resultado HTTP %i', async (status) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status })));
  const work = new LocalPrivateStorage().remove('owner/file');
  if (status === 200) await expect(work).resolves.toBeUndefined();
  else await expect(work).rejects.toThrow();
});
