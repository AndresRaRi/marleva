import { fail, uuid, code } from '../../../../security.js';
export function recoveryRequest(input: unknown, kind: 'request' | 'version' | 'reject' | 'verify') {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    fail(422, 'CAMPOS', 'Revisa los campos');
  const body = input as Record<string, unknown>;
  const fields =
    kind === 'request'
      ? ['reason']
      : kind === 'reject'
        ? ['expected_version', 'reason']
        : kind === 'verify'
          ? ['expected_version', 'factor_id', 'codigo']
          : ['expected_version'];
  if (
    Object.keys(body).some((key) => !fields.includes(key)) ||
    fields.some((key) => !(key in body))
  )
    fail(422, 'CAMPOS', 'Revisa los campos de la solicitud');
  const reason = body.reason;
  if (
    fields.includes('reason') &&
    (typeof reason !== 'string' || !reason.trim() || reason.length > 500)
  )
    fail(422, 'MOTIVO', 'Escribe un motivo de hasta 500 caracteres');
  if (
    kind !== 'request' &&
    (typeof body.expected_version !== 'number' ||
      !Number.isSafeInteger(body.expected_version) ||
      body.expected_version < 1)
  )
    fail(422, 'VERSION', 'Consulta la versión actual');
  return {
    reason: reason as string | undefined,
    version: body.expected_version as number,
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
