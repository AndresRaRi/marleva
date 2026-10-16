import { it, expect, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  ManagementClient,
  ManagementError,
  inputOf,
} from '../../../../apps/client/src/modules/m3/management-client';
import {
  initial,
  input,
  toggle,
} from '../../../../apps/client/src/modules/m3/management-form-data';
import { product, service, sellerId, owner } from '../../../fixtures/m3-fixtures.mjs';
const offerId = randomUUID(),
  versionId = randomUUID(),
  photoId = randomUUID();
const value = () => ({
  id: offerId,
  seller_id: sellerId,
  revision: 1,
  paused: true,
  public_version_id: null,
  versions: [{ ...product, id: versionId, number: 1, state: 'draft', reason: null, photos: [] }],
});
const context = () => ({
  actor_id: owner,
  reviewer: false,
  mfa: false,
  csrf_token: 'fixture-csrf-bound-to-session',
  sellers: [{ id: sellerId, name: 'Oferente ficticio' }],
});
function response(data: unknown, status = 200) {
  return {
    ok: status === 200,
    status,
    json: async () => data,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  } as Response;
}
const signal = () => new AbortController().signal;
it('MAR-M3-UT-FE-004-CONTEXT | sesión mínima, CSRF en memoria y proyección cerrada', async () => {
  const transport = vi.fn().mockResolvedValue(response({ ...context(), secret: 'never-display' }));
  const client = new ManagementClient(undefined, undefined, transport);
  expect(await client.context(signal())).toEqual(context());
  transport.mockResolvedValue(response({ ...value(), original_path: '/private/original' }));
  expect(await client.detail(offerId, signal())).not.toHaveProperty('original_path');
  transport.mockResolvedValue(response({ items: [value()], next_cursor: null }));
  expect((await client.list('own', null, signal())).items).toHaveLength(1);
  expect(transport.mock.calls.at(-1)![1].credentials).toBe('include');
  transport.mockResolvedValue(response({ ...context(), reviewer: 'true' }));
  await expect(client.context(signal())).rejects.toBeInstanceOf(ManagementError);
});
it('MAR-M3-UT-FE-004-WRITE | idempotencia explícita y CSRF de la sesión, sin actor del cliente', async () => {
  const transport = vi.fn().mockResolvedValue(response(context()));
  const client = new ManagementClient(undefined, undefined, transport);
  await client.context(signal());
  transport.mockResolvedValue(
    response({ id: offerId, revision: 1, version_id: versionId, state: 'draft' }),
  );
  const key = randomUUID();
  await client.command(
    'create',
    offerId,
    { id: offerId, seller_id: sellerId, data: product },
    key,
    signal(),
  );
  const options = transport.mock.calls.at(-1)![1];
  expect(options.headers['Idempotency-Key']).toBe(key);
  expect(options.headers['x-csrf-token']).toBe(context().csrf_token);
  expect(JSON.parse(options.body)).not.toHaveProperty('actor');
  await client.command('pause', offerId, { expected_version: 1 }, key, signal());
  expect(transport.mock.calls.at(-1)![0]).toContain('/pause');
  await client.command('edit', offerId, { expected_version: 1, data: product }, key, signal());
  expect(transport.mock.calls.at(-1)![1].method).toBe('PATCH');
});
it('MAR-M3-UT-FE-004-SESSION | Bearer se aporta por puerto cada vez y no se guarda', async () => {
  let token = 'first';
  const transport = vi.fn().mockResolvedValue(response(context()));
  const client = new ManagementClient(
    undefined,
    async () => ({ Authorization: 'Bearer ' + token }),
    transport,
  );
  await client.context(signal());
  token = 'second';
  await client.context(signal());
  expect(transport.mock.calls.at(-1)![1].headers.Authorization).toBe('Bearer second');
  expect(transport.mock.calls.at(-1)![1].credentials).toBe('omit');
});
it('MAR-M3-UT-FE-004-ERROR | sesión, conflicto y red conservan el error y no simulan éxito', async () => {
  const transport = vi.fn().mockResolvedValue(response({ mensaje: 'Actualiza la oferta.' }, 409));
  const client = new ManagementClient(undefined, undefined, transport);
  await expect(client.detail(offerId, signal())).rejects.toMatchObject({
    status: 409,
    message: 'Actualiza la oferta.',
  });
  transport.mockResolvedValue(response({}, 401));
  await expect(client.context(signal())).rejects.toMatchObject({ status: 401 });
  transport.mockRejectedValue(Error('network'));
  await expect(client.context(signal())).rejects.toMatchObject({ status: 503 });
  const controller = new AbortController();
  controller.abort();
  await expect(client.context(controller.signal)).rejects.toThrow('network');
  expect(transport.mock.calls.at(-1)![1].signal.aborted).toBe(true);
});
it('MAR-M3-UT-FE-004-SHAPE | estados, revisiones y fotos inválidas se rechazan', async () => {
  const transport = vi.fn(),
    client = new ManagementClient(undefined, undefined, transport);
  for (const patch of [
    { revision: 0 },
    { versions: [] },
    { public_version_id: 'bad' },
    { versions: [{ ...value().versions[0], number: 0 }] },
    { versions: [{ ...value().versions[0], state: 'published' }] },
    { versions: [{ ...value().versions[0], photos: [{ id: photoId, position: 7 }] }] },
    {
      versions: [
        {
          ...value().versions[0],
          photos: [
            { id: photoId, position: 1 },
            { id: photoId, position: 2 },
          ],
        },
      ],
    },
  ]) {
    transport.mockResolvedValue(response({ ...value(), ...patch }));
    await expect(client.detail(offerId, signal())).rejects.toThrow();
  }
  for (const data of [
    { items: [], next_cursor: 2 },
    { items: 'bad', next_cursor: null },
  ]) {
    transport.mockResolvedValue(response(data));
    await expect(client.list('review', 'cursor', signal())).rejects.toThrow();
  }
  transport.mockResolvedValue(response({ id: offerId, revision: 0, version_id: versionId }));
  await expect(client.command('submit', offerId, {}, randomUUID(), signal())).rejects.toThrow();
});
it('MAR-M3-UT-FE-009 | MIME/tamaño local, ruta cerrada y derivado inesperado', async () => {
  const transport = vi.fn().mockResolvedValue(response({ id: photoId })),
    client = new ManagementClient(undefined, undefined, transport),
    offer = value();
  for (const file of [
    new File(['bad'], 'x.gif', { type: 'image/gif' }),
    new File([], 'x.png', { type: 'image/png' }),
    new File([new Uint8Array(5000001)], 'x.png', { type: 'image/png' }),
  ])
    await expect(client.upload(offer, versionId, file, 1, photoId, signal())).rejects.toMatchObject(
      { status: 422 },
    );
  const file = new File([new Uint8Array(10)], 'not-used-as-path.png', { type: 'image/png' });
  await client.upload(offer, versionId, file, 1, photoId, signal());
  expect(transport.mock.calls.at(-1)![0]).not.toContain(file.name);
  await expect(client.photo(offerId, photoId, signal())).rejects.toThrow();
});
it('MAR-M3-UT-FE-004-FORM | datos coherentes por tipo, decimales exactos y normalización', () => {
  const form = {
    ...initial(null),
    title: '  Ejemplo vecinal ',
    description: '  Una descripción ficticia suficientemente larga. ',
    price: '12.05',
    developments: [1],
    modalities: ['delivery'],
  };
  const data = input(form);
  expect(data.price_cents).toBe(1205);
  expect(data.title).toBe('Ejemplo vecinal');
  expect(toggle([1], 1)).toEqual([]);
  expect(toggle([], 1)).toEqual([1]);
  expect(input({ ...form, kind: 'service', modalities: ['home'] })).toMatchObject({
    price_cents: null,
    stock: null,
    unit: null,
    made_to_order: false,
  });
  const managed = value();
  expect(initial(managed).title).toBe(product.title);
  expect(inputOf({ ...service, original_path: 'hidden' })).not.toHaveProperty('original_path');
  for (const patch of [
    { title: '' },
    { description: 'short' },
    { price: '0' },
    { price: '1.001' },
    { stock: '1.5' },
    { response: '0' },
    { preparation: '525601' },
    { developments: [] },
    { modalities: [] },
    { stock: '9999999999999999999' },
    { category: 'food' },
  ])
    expect(() => input({ ...form, ...patch })).toThrow();
  expect(
    input({
      ...form,
      category: 'food',
      ingredients: ' Harina ',
      allergens: ' Trigo ',
      storage: ' Seco ',
    }),
  ).toMatchObject({ food: { ingredients: 'Harina', allergens: 'Trigo', storage: 'Seco' } });
});
