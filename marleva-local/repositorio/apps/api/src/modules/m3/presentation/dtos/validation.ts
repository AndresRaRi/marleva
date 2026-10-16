import { fail } from '../../domain/catalog.js';
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail('FIELDS', 'Revisa los campos.');
  return value as Record<string, unknown>;
}
export function keys(value: Record<string, unknown>, allowed: string[]): void {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    fail('FIELDS', 'Hay campos no permitidos.');
}
export function string(value: unknown, min: number, max: number): string {
  if (typeof value !== 'string') fail('FIELDS', 'Revisa el texto.');
  const result = value.normalize('NFC').trim();
  const controls = [...result].some(
    (character) => character.charCodeAt(0) < 32 && !['\t', '\n', '\r'].includes(character),
  );
  if ([...result].length < min || [...result].length > max || controls) {
    fail('FIELDS', 'Revisa la longitud o los caracteres del texto.');
  }
  return result;
}
export function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    fail('FIELDS', 'Revisa el número indicado.');
  }
  return value;
}
export function uuid(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value)
  ) {
    fail('FIELDS', 'El identificador no es válido.');
  }
  return value.toLowerCase();
}
export function choice<T extends string>(value: unknown, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T))
    fail('FIELDS', 'Elige una opción válida.');
  return value as T;
}
export function list<T>(value: unknown, max: number, parse: (item: unknown) => T): T[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > max)
    fail('FIELDS', 'Revisa las opciones elegidas.');
  const result = value.map(parse);
  if (new Set(result).size !== result.length) fail('FIELDS', 'No repitas opciones.');
  return result;
}
