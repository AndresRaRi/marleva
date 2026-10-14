import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from 'node:crypto';
import { HttpException } from '@nestjs/common';
export const digest = (v: string) => createHash('sha256').update(v).digest('hex');
export const secret = () => randomBytes(32).toString('base64url');
export function seal(value: unknown, key: string) {
  const nonce = randomBytes(12),
    c = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), nonce);
  return Buffer.concat([
    nonce,
    c.update(JSON.stringify(value)),
    c.final(),
    c.getAuthTag(),
  ]).toString('base64');
}
export function unseal<T>(value: string, key: string): T {
  const b = Buffer.from(value, 'base64'),
    c = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), b.subarray(0, 12));
  c.setAuthTag(b.subarray(-16));
  return JSON.parse(Buffer.concat([c.update(b.subarray(12, -16)), c.final()]).toString());
}
export function equalHash(value: string, expected: string) {
  const h = Buffer.from(digest(value), 'hex'),
    e = Buffer.from(expected, 'hex');
  return e.length === h.length && timingSafeEqual(h, e);
}
export function fail(
  status: number,
  code: string,
  message: string,
  action = 'Intenta de nuevo o solicita ayuda',
): never {
  throw new HttpException({ codigo: code, mensaje: message, accion_recuperacion: action }, status);
}
export function email(input: unknown): string {
  if (typeof input !== 'string' || input.length > 254 || !/^[^\s@]+@example\.test$/i.test(input))
    fail(422, 'CORREO_LOCAL', 'Usa un correo ficticio @example.test');
  return input.trim().toLowerCase();
}
export function uuid(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)
  )
    fail(422, 'IDENTIFICADOR', 'Identificador inválido');
  return value;
}
export function code(input: unknown): string {
  if (typeof input !== 'string' || !/^\d{6}$/.test(input))
    fail(422, 'CODIGO_FORMATO', 'Escribe el código de seis cifras');
  return input;
}
