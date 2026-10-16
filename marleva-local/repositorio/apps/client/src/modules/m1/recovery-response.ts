import type { ApiResponse } from '../../api-response';
type Recovery = ApiResponse<'MAR_M1_API_016'>;
const states = [
  'requested',
  'approved',
  'executing',
  'provider_pending',
  'reenrollment',
  'completed',
  'rejected',
  'expired',
];
export function recoveryResponse(value: unknown): Recovery {
  if (!value || typeof value !== 'object') throw invalid();
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== 'string' ||
    !states.includes(String(row.state)) ||
    typeof row.version !== 'number' ||
    !Number.isSafeInteger(row.version) ||
    row.version < 1
  )
    throw invalid();
  return value as Recovery;
}
export function currentRecoveryResponse(value: unknown): Recovery | null {
  if (!value || typeof value !== 'object' || !('recuperacion' in value)) throw invalid();
  return value.recuperacion === null ? null : recoveryResponse(value.recuperacion);
}
function invalid() {
  return new Error('No pudimos comprobar la recuperación. Consulta el estado antes de continuar.');
}
