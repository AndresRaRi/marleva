import { it, expect } from 'vitest';
import {
  email,
  code,
  uuid,
  seal,
  unseal,
  equalHash,
  digest,
} from '../../../../apps/api/src/security.ts';
it('MAR-M1-UT-BE-002 | SEQ001:S010 | acepta solo dirección ficticia y rechaza dirección externa', () => {
  expect(email('A@example.test')).toBe('a@example.test');
  expect(() => email('a@example.com')).toThrow();
  expect(() => email(null)).toThrow();
});
it('MAR-M1-UT-BE-003 | SEQ002:S020 | formato de código no admite vacío ni contenido arbitrario', () => {
  expect(code('123456')).toBe('123456');
  for (const v of ['', 123456, '<script>', '12345']) expect(() => code(v)).toThrow();
});
it('MAR-M1-UT-BE-004 | SEQ003:S020 | valida formato UUID; no prueba autorización', () => {
  expect(uuid('11111111-1111-4111-8111-111111111111')).toBe('11111111-1111-4111-8111-111111111111');
  expect(() => uuid('1')).toThrow();
});
it('MAR-M1-UT-BE-005 | SEQ003:S060 | cifrado autenticado rechaza alteración sin revelar tokens', () => {
  const key = 'a'.repeat(64),
    fixture = { value: 'ficticio' },
    value = seal(fixture, key);
  expect(unseal(value, key)).toEqual(fixture);
  const b = Buffer.from(value, 'base64');
  b[20] ^= 1;
  expect(() => unseal(b.toString('base64'), key)).toThrow();
  expect(equalHash('fixture', digest('fixture'))).toBe(true);
  expect(equalHash('ajeno', digest('fixture'))).toBe(false);
});
