import { it, expect, vi } from 'vitest';
import { ReadCatalog } from '../../../../apps/api/src/modules/m3/application/use-cases/read-catalog.ts';
import { ChangeOffer } from '../../../../apps/api/src/modules/m3/application/use-cases/change-offer.ts';
import { transition } from '../../../../apps/api/src/modules/m3/domain/offer-transition.ts';
import { destination } from '../../../../apps/api/src/modules/m3/infrastructure/prisma-sql.ts';
import { command, actor, reviewActor, seller, product } from '../../../fixtures/m3-fixtures.mjs';
it('MAR-M3-UT-BE-001-P | última página, vacío y fallo recuperable', async () => {
  const list = vi.fn().mockResolvedValue([]);
  const reader = new ReadCatalog({ list, detail: async () => null, seller: async () => null });
  expect(await reader.list({ limit: 24 })).toEqual({ items: [], next_cursor: null });
  await expect(reader.detail(seller.id)).rejects.toMatchObject({ status: 404 });
  await expect(reader.seller(seller.id)).rejects.toMatchObject({ status: 404 });
  list.mockRejectedValue(Error('DB temporal'));
  await expect(reader.list({ limit: 24 })).rejects.toThrow('DB temporal');
});
it('MAR-M3-UT-BE-001-PAGE | cursor solo cuando existe otra página', async () => {
  const row = {
    offer: { id: seller.id },
    boundary: { at: '2026-10-15T10:00:00.000001Z', id: seller.id },
  };
  const reader = new ReadCatalog({
    list: async () => [row, row],
    detail: async () => row.offer,
    seller: async () => ({ id: seller.id, name: 'Ficticio' }),
  });
  const page = await reader.list({ limit: 1 });
  expect(page.items).toHaveLength(1);
  expect(page.next_cursor).toBeTypeOf('string');
  expect(await reader.detail(seller.id)).toEqual(row.offer);
  expect(await reader.seller(seller.id)).toEqual({ id: seller.id, name: 'Ficticio' });
});
it('MAR-M3-UT-BE-004-HASH | orden de propiedades no cambia identidad del cuerpo', async () => {
  const hashes = [];
  const repository = {
    change: async (cmd, who, hash, decide) => {
      hashes.push(hash);
      const result = decide(null, seller);
      return { id: result.id, revision: result.revision };
    },
  };
  const usecase = new ChangeOffer(repository),
    input = command('create', { data: product });
  await usecase.execute(input, actor);
  await usecase.execute(Object.fromEntries(Object.entries(input).reverse()), actor);
  expect(hashes[0]).toBe(hashes[1]);
});
it('MAR-M3-UT-BE-006-C | corrección/rechazo no publican; motivos y versiones inválidos fallan', () => {
  const create = command('create', { data: product }),
    draft = transition(null, seller, create, actor);
  const input = {
    ...create,
    operation: 'submit',
    expected_revision: 1,
    version_id: draft.versions[0].id,
  };
  expect(() => transition(draft, seller, { ...input, version_id: seller.id }, actor)).toThrow();
  const pending = transition(draft, seller, input, actor);
  expect(() =>
    transition(
      pending,
      seller,
      { ...create, operation: 'edit', expected_revision: 2, data: product },
      actor,
    ),
  ).toThrow();
  for (const decision of ['correction', 'rejected']) {
    const output = transition(
      pending,
      seller,
      {
        ...create,
        operation: 'decide',
        expected_revision: 2,
        version_id: input.version_id,
        decision,
        reason: 'Corregir contenido ficticio',
      },
      reviewActor,
    );
    expect(output.public_version_id).toBeNull();
    expect(output.versions[0].state).toBe(decision);
  }
  const review = {
    ...create,
    operation: 'decide',
    expected_revision: 2,
    version_id: input.version_id,
    decision: 'approved',
    reason: '',
  };
  expect(() => transition(pending, seller, review, reviewActor)).toThrow();
  expect(() =>
    transition(pending, seller, { ...review, decision: 'invented', reason: 'ok' }, reviewActor),
  ).toThrow();
  expect(() => transition(null, seller, { ...input, expected_revision: 1 }, actor)).toThrow();
  expect(() => transition(draft, seller, { ...input, operation: 'create' }, actor)).toThrow();
});
it('MAR-M3-UT-BE-010 | guardia de destino rechaza M1 antes de conectar', () => {
  const previous = process.env.M3_DATABASE_URL;
  process.env.M3_DATABASE_URL = 'postgresql://m3_api:fixture@127.0.0.1:54322/postgres';
  try {
    expect(() => destination()).toThrow('Destino M3');
  } finally {
    if (previous === undefined) delete process.env.M3_DATABASE_URL;
    else process.env.M3_DATABASE_URL = previous;
  }
});

it.each([
  'postgresql://m3_api:fixture@127.0.0.1:55432/marleva_m3_008?host=127.0.0.1&port=54322',
  'http://m3_api:fixture@127.0.0.1:55432/marleva_m3_008',
])('MAR-M3-UT-BE-010-URL | rechaza redirección por opciones/protocolo %s', (value) => {
  const previous = process.env.M3_DATABASE_URL;
  process.env.M3_DATABASE_URL = value;
  try {
    expect(() => destination()).toThrow('Destino M3');
  } finally {
    if (previous === undefined) delete process.env.M3_DATABASE_URL;
    else process.env.M3_DATABASE_URL = previous;
  }
});
