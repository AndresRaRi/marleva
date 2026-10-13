import { it, expect } from 'vitest';
import { NoticeQuery } from '../../../../apps/api/dist/modules/m1/presentation/dtos/notice-query.js';
import {
  encodeNoticeCursor,
  decodeNoticeCursor,
} from '../../../../apps/api/dist/modules/m1/domain/notice-cursor.js';
import { ListNotices } from '../../../../apps/api/dist/modules/m1/application/use-cases/list-notices.js';
const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';
const boundary = { accountId: a, createdAt: '2026-10-13T12:00:00.123456Z', id: a };

it('MAR-M1-UT-BE-108-A | SEQ008:S075 | query estricta y límites', () => {
  expect(NoticeQuery.parse({}, a).limit).toBe(24);
  expect(NoticeQuery.parse({ limit: '50' }, a).limit).toBe(50);
  for (const input of [
    { limit: '0' },
    { limit: '51' },
    { limit: '01' },
    { limit: '1.5' },
    { limit: ['1', '2'] },
    { accountId: b },
    { cursor: '' },
    { cursor: ['a', 'b'] },
  ]) {
    expect(() => NoticeQuery.parse(input, a)).toThrow();
    try {
      NoticeQuery.parse(input, a);
    } catch (e) {
      expect(e.getStatus()).toBe(422);
      expect(e.getResponse().codigo).toBe('PAGINACION');
    }
  }
});
it('MAR-M1-UT-BE-108-B | SEQ008:S075 | cursor conserva microsegundos sin autorizar otra cuenta', () => {
  const value = encodeNoticeCursor(boundary);
  expect(decodeNoticeCursor(value, a)).toEqual(boundary);
  expect(() => decodeNoticeCursor(value, b)).toThrow();
  for (const value of [
    '!',
    'a'.repeat(513),
    Buffer.from('{').toString('base64url'),
    encodeNoticeCursor({ ...boundary, createdAt: '2026-02-30T12:00:00.123456Z' }),
    encodeNoticeCursor({ ...boundary, id: "' OR true" }),
  ])
    expect(() => decodeNoticeCursor(value, a)).toThrow();
});
it('MAR-M1-UT-BE-108-C | SEQ008:S085 | vacío/final sin cursor y siguiente frontera exacta', async () => {
  let rows = [];
  const useCase = new ListNotices({ page: async () => rows });
  expect(await useCase.execute(a, 1)).toEqual({ items: [], next_cursor: null });
  rows = [{ ...boundary, kind: 'fixture', text: 'ficticio' }];
  expect((await useCase.execute(a, 1)).next_cursor).toBe(null);
  rows.push({ ...rows[0], id: b });
  const page = await useCase.execute(a, 1);
  expect(page.items).toHaveLength(1);
  expect(decodeNoticeCursor(page.next_cursor, a)).toEqual(boundary);
});
it('MAR-M1-UT-BE-108-D | SEQ008:S097 | caída no se convierte en lista vacía', async () => {
  const useCase = new ListNotices({
    page: async () => {
      throw new Error('dependency');
    },
  });
  await expect(useCase.execute(a, 24)).rejects.toThrow('dependency');
});
