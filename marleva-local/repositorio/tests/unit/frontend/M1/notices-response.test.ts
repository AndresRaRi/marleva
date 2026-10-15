import { describe, it, expect } from 'vitest';
import { noticesResponse } from '../../../../apps/client/src/modules/m1/notices-response';
const item = {
  id: 'notice-fixture',
  accountId: 'account-a',
  kind: 'fixture',
  text: 'Aviso propio',
  createdAt: '2026-10-15T12:00:00Z',
};
describe('MAR-M1-UT-FE-108 | SEQ008:S090/S097 | respuesta de avisos', () => {
  it('conserva lista propia y cursor del contrato', () => {
    const response = { items: [item], next_cursor: 'cursor-fixture' };
    expect(noticesResponse(response, 'account-a')).toEqual(response);
  });
  it('acepta vacío únicamente como respuesta completa confirmada', () => {
    expect(noticesResponse({ items: [], next_cursor: null }, 'account-a').items).toEqual([]);
  });
  it.each([
    null,
    {},
    { items: null, next_cursor: null },
    { items: [], next_cursor: 4 },
    { items: [null], next_cursor: null },
    { items: [{ ...item, text: null }], next_cursor: null },
  ])('rechaza respuesta inválida sin convertirla en vacío: %j', (value) => {
    expect(() => noticesResponse(value, 'account-a')).toThrow('No pudimos consultar');
  });
  it('rechaza avisos de otra cuenta aunque la respuesta sea estructuralmente válida', () => {
    expect(() => noticesResponse({ items: [item], next_cursor: null }, 'account-b')).toThrow(
      'No pudimos consultar',
    );
  });
});
