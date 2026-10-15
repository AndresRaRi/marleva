import { fail } from '../../../../security.js';
export function accountRequest(input: unknown, fields: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    fail(422, 'CAMPOS', 'Revisa los campos de la solicitud');
  const body = input as Record<string, unknown>;
  if (
    Object.keys(body).some((key) => !fields.includes(key)) ||
    fields.some((field) => !(field in body))
  )
    fail(422, 'CAMPOS', 'Revisa los campos de la solicitud');
  return body;
}
