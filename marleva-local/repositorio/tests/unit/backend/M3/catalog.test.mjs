import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { parseOfferData } from '../../../../apps/api/src/modules/m3/presentation/dtos/offer-data.ts';
import { parseQuery } from '../../../../apps/api/src/modules/m3/presentation/dtos/catalog-query.ts';
import {
  encodeCursor,
  decodeCursor,
} from '../../../../apps/api/src/modules/m3/domain/catalog-cursor.ts';
import {
  transition,
  authorize,
} from '../../../../apps/api/src/modules/m3/domain/offer-transition.ts';
import { publicData, publicSeller } from '../../../../apps/api/src/modules/m3/domain/catalog.ts';
import {
  product,
  service,
  actor,
  reviewActor,
  seller,
  command,
} from '../../../fixtures/m3-fixtures.mjs';
it('MAR-M3-UT-BE-001 | SEQ001:S020 | filtros cerrados y límite', () => {
  expect(parseQuery({})).toEqual({ limit: 24 });
  expect(parseQuery({ limit: '50', development: '7', kind: 'service' })).toMatchObject({
    limit: 50,
    development: 7,
  });
  for (const input of [
    { limit: '51' },
    { limit: '0' },
    { limit: '1.5' },
    { q: ['a', 'b'] },
    { near: '1' },
    { development: '8' },
    { category: 'alcohol' },
    { cursor: ['x', 'y'] },
  ])
    expect(() => parseQuery(input)).toThrow();
});
it('MAR-M3-UT-BE-001-C | cursor conserva microsegundos y filtros', () => {
  const boundary = { at: '2026-10-15T12:00:00.123456Z', id: randomUUID() };
  const cursor = encodeCursor(boundary, { q: 'pan' });
  expect(decodeCursor(cursor, { q: 'pan' })).toEqual(boundary);
  expect(() => decodeCursor(cursor, { q: 'otro' })).toThrow();
  for (const invalid of ['!!!', '', Buffer.from('{}').toString('base64url')])
    expect(() => decodeCursor(invalid, {})).toThrow();
});
it('MAR-M3-UT-BE-002 | proyección excluye identidad/expediente', () => {
  expect(publicSeller({ ...seller, email: 'private@example.test', address: 'PRIVATE' })).toEqual({
    id: seller.id,
    name: seller.public_name,
  });
  expect(publicData({ ...product, private_note: 'PRIVATE' })).toEqual(product);
});
it('MAR-M3-UT-BE-004 | producto, servicio y normalización', () => {
  expect(parseOfferData({ ...product, title: '  Pan de prueba  ' })).toMatchObject({
    title: 'Pan de prueba',
  });
  expect(parseOfferData(service)).toEqual(service);
  expect(parseOfferData({ ...product, made_to_order: true, stock: null })).toMatchObject({
    stock: null,
  });
});
it.each([
  { price_cents: 0 },
  { price_cents: 1.5 },
  { price_cents: 2147483648 },
  { stock: -1 },
  { stock: null },
  { title: 'x' },
  { description: 'corta' },
  { developments: [8] },
  { developments: [1, 1] },
  { modalities: ['home'] },
  { response_minutes: 1441 },
  { preparation_minutes: -1 },
  { food: null },
  { food: { ingredients: 'a', allergens: '', storage: 'b' } },
  { unknown: 'field' },
])('MAR-M3-UT-BE-004-N | rechaza campos inválidos %j', (patch) =>
  expect(() => parseOfferData({ ...product, ...patch })).toThrow(),
);
it('MAR-M3-UT-BE-004-S | no total ficticio para servicio', () => {
  expect(() => parseOfferData({ ...service, price_cents: 100 })).toThrow();
  expect(() => parseOfferData({ ...service, made_to_order: true })).toThrow();
});
it('MAR-M3-UT-BE-004/005/006/007 | recorrido y conservación de versión', () => {
  const create = command('create', { data: product });
  const draft = transition(null, seller, create, actor);
  const submitted = transition(
    draft,
    seller,
    { ...create, operation: 'submit', expected_revision: 1, version_id: draft.versions[0].id },
    actor,
  );
  const approved = transition(
    submitted,
    seller,
    {
      ...create,
      operation: 'decide',
      expected_revision: 2,
      version_id: draft.versions[0].id,
      decision: 'approved',
      reason: 'Datos ficticios revisados',
    },
    reviewActor,
  );
  expect(approved.paused).toBe(false);
  const edited = transition(
    approved,
    seller,
    {
      ...create,
      operation: 'edit',
      expected_revision: 3,
      data: { ...product, price_cents: 13000 },
    },
    actor,
  );
  expect(edited.versions[0]).toEqual(approved.versions[0]);
  expect(edited.public_version_id).toBe(approved.public_version_id);
  expect(edited.paused).toBe(false);
  const stock = transition(
    approved,
    seller,
    { ...create, operation: 'edit', expected_revision: 3, data: { ...product, stock: 4 } },
    actor,
  );
  expect(stock.paused).toBe(true);
  expect(
    transition(approved, seller, { ...create, operation: 'pause', expected_revision: 3 }, actor)
      .paused,
  ).toBe(true);
});
it('MAR-M3-UT-BE-006-N | revisión exacta, actual y sin autorrevisión', () => {
  expect(() => authorize({ ...actor, reviewer: true, mfa: true }, seller, 'decide')).toThrow();
  expect(() => authorize({ ...reviewActor, mfa: false }, seller, 'decide')).toThrow();
  expect(() => authorize(reviewActor, { ...seller, enabled: false }, 'decide')).toThrow();
  const create = command('create', { data: product }),
    draft = transition(null, seller, create, actor);
  expect(() =>
    transition(draft, seller, { ...create, operation: 'submit', expected_revision: 0 }, actor),
  ).toThrow();
  expect(() =>
    transition(
      draft,
      seller,
      {
        ...create,
        operation: 'decide',
        expected_revision: 1,
        version_id: draft.versions[0].id,
        decision: 'approved',
        reason: 'ok',
      },
      reviewActor,
    ),
  ).toThrow();
});
