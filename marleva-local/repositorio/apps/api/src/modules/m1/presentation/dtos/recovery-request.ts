import { fail, uuid, code } from '../../../../security.js';
type Kind = 'request' | 'version' | 'reject' | 'verify';
const requiredFields: Record<Kind, string[]> = {
  request: ['reason'],
  version: ['expected_version'],
  reject: ['expected_version', 'reason'],
  verify: ['expected_version', 'factor_id', 'codigo'],
};
function validatedBody(input: unknown, fields: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    fail(422, 'CAMPOS', 'Revisa los campos');
  const body = input as Record<string, unknown>;
  if (
    Object.keys(body).some((key) => !fields.includes(key)) ||
    fields.some((key) => !(key in body))
  )
    fail(422, 'CAMPOS', 'Revisa los campos de la solicitud');
  return body;
}
function checkedReason(reason: unknown) {
  if (typeof reason !== 'string' || !reason.trim() || reason.length > 500)
    fail(422, 'MOTIVO', 'Escribe un motivo de hasta 500 caracteres');
  return reason;
}
function checkedVersion(version: unknown) {
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1)
    fail(422, 'VERSION', 'Consulta la versión actual');
  return version;
}
export function recoveryRequest(input: unknown, kind: Kind) {
  const fields = requiredFields[kind],
    body = validatedBody(input, fields);
  return {
    reason: fields.includes('reason') ? checkedReason(body.reason) : undefined,
    version:
      kind === 'request'
        ? (body.expected_version as number)
        : checkedVersion(body.expected_version),
    factorId: kind === 'verify' ? uuid(body.factor_id) : undefined,
    code: kind === 'verify' ? code(body.codigo) : undefined,
  };
}
export function recoveryKey(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 128 || /[\r\n\0]/.test(value))
    fail(422, 'IDEMPOTENCIA', 'Falta una clave válida para esta operación');
  return value;
}
export function recoveryCapability(value: unknown): string {
  if (typeof value !== 'string' || value.length !== 43 || !/^[A-Za-z0-9_-]+$/.test(value))
    fail(403, 'CAPACIDAD', 'Solicita autorización de recuperación');
  return value;
}
