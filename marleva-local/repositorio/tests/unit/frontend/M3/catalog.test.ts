import { it, expect, vi } from 'vitest';
import {
  CatalogClient,
  parsePage,
  parseOffer,
} from '../../../../apps/client/src/modules/m3/catalog-client';
import { CatalogStore } from '../../../../apps/client/src/modules/m3/catalog-store';
const offer = {
  id: 'a',
  version_id: 'v',
  version: 1,
  title: 'Pan',
  description: 'Descripción ficticia de oferta',
  kind: 'product',
  category: 'food',
  price_cents: 100,
  unit: 'pieza',
  stock: 1,
  made_to_order: false,
  developments: [1],
  modalities: ['delivery'],
  response_minutes: 60,
  preparation_minutes: 0,
  food: null,
  seller: { id: 's', name: 'Ficticio' },
  photos: [],
  updated_at: '2026-10-15T00:00:00Z',
};
it('MAR-M3-UT-FE-001-BROWSER | conserva el receptor requerido por fetch nativo', async () => {
  const transport = vi.fn(function (this: unknown) {
    if (this !== globalThis) throw new TypeError('Illegal invocation');
    return Promise.resolve(new Response(JSON.stringify({ items: [], next_cursor: null })));
  });
  await expect(
    new CatalogClient('http://127.0.0.1:3103', transport).list(
      {},
      null,
      new AbortController().signal,
    ),
  ).resolves.toEqual({ items: [], next_cursor: null });
});
it('MAR-M3-UT-FE-001 | error/red nunca equivalen a vacío confirmado', async () => {
  const transport = vi.fn().mockRejectedValue(new Error('offline'));
  const store = new CatalogStore(new CatalogClient('http://127.0.0.1:3103', transport));
  await store.load({ q: 'pan' });
  expect(store.state).toMatchObject({ phase: 'error', search: { q: 'pan' }, items: [] });
  transport.mockResolvedValue(new Response(JSON.stringify({ items: [], next_cursor: null })));
  await store.load();
  expect(store.state).toMatchObject({ phase: 'ready', items: [], error: null });
  expect(transport.mock.calls[0][1].credentials).toBe('omit');
});
it('MAR-M3-UT-FE-001-LATE | ignora respuesta tardía y cancela consulta anterior', async () => {
  let finish: (value: Response) => void = () => {
    throw Error('not requested');
  };
  const transport = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce(new Response(JSON.stringify({ items: [], next_cursor: null })));
  const store = new CatalogStore(new CatalogClient('http://127.0.0.1:3103', transport));
  const old = store.load({ q: 'vieja' });
  await store.load({ q: 'nueva' });
  finish(new Response('invalid json'));
  await old;
  expect(transport.mock.calls[0][1].signal.aborted).toBe(true);
  expect(store.state).toMatchObject({ phase: 'ready', search: { q: 'nueva' }, error: null });
});
it('MAR-M3-UT-FE-001-PAGE | valida forma recibida', () => {
  for (const value of [
    null,
    [],
    {},
    { items: [], next_cursor: 1 },
    { items: [{ id: 'broken' }], next_cursor: null },
  ])
    expect(() => parsePage(value)).toThrow();
});
it('MAR-M3-UT-FE-001-DISPOSE | desmontaje no publica fallo tardío', async () => {
  let reject: (reason: Error) => void = () => {
    throw Error('not requested');
  };
  const transport = vi.fn(
    () =>
      new Promise<Response>((_, fail) => {
        reject = fail;
      }),
  );
  const store = new CatalogStore(new CatalogClient('http://127.0.0.1:3103', transport));
  const listener = vi.fn();
  store.subscribe(listener);
  const pending = store.load();
  store.dispose();
  reject(Error('late'));
  await pending;
  expect(listener).toHaveBeenCalledTimes(1);
});
it('MAR-M3-UT-FE-001-PAGING | siguiente página conserva anteriores y evita duplicados', async () => {
  const transport = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ items: [offer], next_cursor: 'cursor' })))
    .mockRejectedValueOnce(Error('offline'))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [offer, { ...offer, id: 'b' }], next_cursor: null })),
    );
  const store = new CatalogStore(new CatalogClient('http://127.0.0.1:3103', transport));
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  await store.load({ q: 'pan' });
  await store.load(store.state.search, true);
  expect(store.state.items).toHaveLength(1);
  expect(store.state.error).not.toBeNull();
  await store.load(store.state.search, true);
  expect(store.state.items.map((item) => item.id)).toEqual(['a', 'b']);
  expect(transport.mock.calls[2][0]).toContain('cursor=cursor');
  unsubscribe();
  const calls = listener.mock.calls.length;
  await store.load(store.state.search, true);
  expect(listener).toHaveBeenCalledTimes(calls);
});
it('MAR-M3-UT-FE-002/003 | recurso real válido,404 y perfil incompleto', async () => {
  const transport = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(offer)))
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 's', name: 'Ficticio' })))
    .mockResolvedValueOnce(new Response('{}', { status: 404 }))
    .mockResolvedValueOnce(new Response('{}'));
  const client = new CatalogClient('http://127.0.0.1:3103', transport),
    signal = new AbortController().signal;
  expect((await client.detail('a', signal)).title).toBe('Pan');
  expect(await client.seller('s', signal)).toEqual({ id: 's', name: 'Ficticio' });
  await expect(client.detail('missing', signal)).rejects.toMatchObject({ status: 404 });
  await expect(client.seller('broken', signal)).rejects.toMatchObject({ status: 503 });
});
it('MAR-M3-UT-FE-001-INVALID | campos y precio inválidos no llegan a la pantalla', () => {
  for (const patch of [
    { kind: 'other' },
    { seller: null },
    { title: 1 },
    { price_cents: 0 },
    { kind: 'service', price_cents: 10 },
    { modalities: null },
    { made_to_order: 1 },
    { version: '1' },
    { developments: [8] },
  ])
    expect(() => parseOffer({ ...offer, ...patch })).toThrow();
  expect(
    parseOffer({ ...offer, kind: 'service', price_cents: null, unit: null, stock: null }).kind,
  ).toBe('service');
});
it('MAR-M3-UT-FE-001-HTTP | respuesta ilegible y503 muestran recuperación', async () => {
  const transport = vi
    .fn()
    .mockResolvedValueOnce(new Response('{'))
    .mockResolvedValueOnce(new Response('{}', { status: 503 }));
  const client = new CatalogClient('http://127.0.0.1:3103', transport);
  await expect(client.list({}, null, new AbortController().signal)).rejects.toMatchObject({
    status: 503,
  });
  await expect(client.list({}, null, new AbortController().signal)).rejects.toMatchObject({
    status: 503,
  });
});
