import { it, expect } from 'vitest';
import { SafeReturn, sessionExpired } from '../../../../apps/client/src/modules/m1/safe-return';
import { accountResponse } from '../../../../apps/client/src/modules/m1/account-response';
import { emailChangeResponse } from '../../../../apps/client/src/modules/m1/email-change-response';
import { factorResponse } from '../../../../apps/client/src/modules/m1/factor-response';
import {
  currentRecoveryResponse,
  recoveryResponse,
} from '../../../../apps/client/src/modules/m1/recovery-response';
import { OperationKeys } from '../../../../apps/client/src/modules/m1/operation-keys';
it('MAR-M1-UT-FE-109-A | retorno solo misma identidad, consumido una vez y sin URL externa', () => {
  const intent = new SafeReturn();
  intent.remember('a', 'cambio_correo');
  expect(intent.consume('b')).toBe('cuenta');
  expect(intent.consume('a')).toBe('cuenta');
  intent.remember('a', 'avisos');
  expect(intent.consume('a')).toBe('avisos');
  expect(intent.consume('a')).toBe('cuenta');
  intent.remember('a', 'ayuda');
  intent.clear();
  expect(intent.consume('a')).toBe('cuenta');
  expect(() => intent.remember('a', 'https://outside.example' as never)).toThrow();
});
it.each([
  ['SESION', true],
  ['SESION_VENCIDA', true],
  ['CODIGO_NO_VALIDO', false],
  ['FACTOR', false],
])('MAR-M1-UT-FE-109-B |401 %s expira sesión=%s', (code, expected) => {
  expect(sessionExpired(Object.assign(new Error('fixture'), { status: 401, code }))).toBe(expected);
});
it('MAR-M1-UT-FE-109-C | errores recuperables y sin formato no revocan por apariencia', () => {
  expect(sessionExpired('401')).toBe(false);
  expect(sessionExpired(new Error('401'))).toBe(false);
  expect(sessionExpired(Object.assign(new Error('caída'), { status: 503 }))).toBe(false);
});
const account = {
  id: 'a',
  correo: 'a@example.test',
  estado: 'active',
  pertenencia: 'no_verificada',
  operador: false,
  acciones_permitidas: [],
};
it('MAR-M1-UT-FE-109-D | no autentica una cuenta incompleta', () => {
  expect(accountResponse(account)).toEqual(account);
  for (const value of [
    null,
    {},
    { ...account, operador: 'false' },
    { ...account, acciones_permitidas: [1] },
  ])
    expect(() => accountResponse(value)).toThrow();
});
const change = {
  id: 'change',
  account_id: 'a',
  correo_actual: 'a@example.test',
  correo_nuevo: 'b@example.test',
  actual_confirmado: false,
  nuevo_confirmado: true,
  estado: 'verificar_ambos_buzones',
  vence_en: '2026-10-15T19:00:00Z',
};
it('MAR-M1-UT-FE-109-E | recupera cambio propio o null y rechaza otro titular', () => {
  expect(emailChangeResponse({ cambio: change }, 'a')).toEqual(change);
  expect(emailChangeResponse({ cambio: null }, 'a')).toBeNull();
  for (const value of [
    null,
    {},
    { cambio: [] },
    { cambio: { ...change, account_id: 'b' } },
    { cambio: { ...change, estado: 'unknown' } },
    { cambio: { ...change, actual_confirmado: 'false' } },
  ])
    expect(() => emailChangeResponse(value, 'a')).toThrow();
});
it('MAR-M1-UT-FE-107-FACTORS | factores validados sin copiar secretos extra', () => {
  expect(
    factorResponse({
      items: [{ id: 'factor', nombre: 'Autenticador', estado: 'verified', uri: 'not-copied' }],
    }),
  ).toEqual([{ id: 'factor', nombre: 'Autenticador', estado: 'verified' }]);
  for (const value of [
    null,
    {},
    { items: [null] },
    { items: [{ id: 'factor', nombre: 'name', estado: 'unknown' }] },
    { items: Array(51).fill({}) },
  ])
    expect(() => factorResponse(value)).toThrow();
});
it('MAR-M1-UT-FE-114-CURRENT | recuperación íntegra y claves de operación sin credenciales', () => {
  const record = { id: 'r', state: 'requested', version: 1 };
  expect(recoveryResponse(record)).toEqual(record);
  expect(currentRecoveryResponse({ recuperacion: record })).toEqual(record);
  expect(currentRecoveryResponse({ recuperacion: null })).toBeNull();
  for (const value of [
    null,
    {},
    { id: 'r', state: 'unknown', version: 1 },
    { ...record, version: 1.2 },
  ])
    expect(() => recoveryResponse(value)).toThrow();
  expect(() => currentRecoveryResponse({})).toThrow();
  const keys = new OperationKeys('a');
  const first = keys.forOperation('request:1');
  expect(keys.forOperation('request:1')).toBe(first);
  expect(keys.forOperation('request:2')).not.toBe(first);
  keys.clear();
  expect(keys.forOperation('request:1')).not.toBe(first);
});
