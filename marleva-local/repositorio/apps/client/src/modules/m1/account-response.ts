import type { components } from '../../../../../packages/contracts/generated';
type Account = components['schemas']['Account'];
export function accountResponse(value: unknown): Account {
  if (!value || typeof value !== 'object') throw new Error('No pudimos comprobar tu cuenta');
  const row = value as Record<string, unknown>;
  if (
    ['id', 'correo', 'estado', 'pertenencia'].some((field) => typeof row[field] !== 'string') ||
    typeof row.operador !== 'boolean' ||
    !Array.isArray(row.acciones_permitidas) ||
    row.acciones_permitidas.some((action) => typeof action !== 'string')
  )
    throw new Error('No pudimos comprobar tu cuenta');
  return value as Account;
}
