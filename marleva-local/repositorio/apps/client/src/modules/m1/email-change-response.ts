import type { ApiResponse } from '../../api-response';
type Progress = ApiResponse<'MAR_M1_API_025'>['cambio'];
const states = [
  'enviando',
  'verificar_ambos_buzones',
  'verificando',
  'conciliando',
  'completo',
  'fallido',
  'vencido',
];
export function emailChangeResponse(value: unknown, accountId: string): Progress {
  if (!record(value) || !Object.hasOwn(value, 'cambio')) throw invalid();
  const row = value.cambio;
  if (row === null) return null;
  if (!record(row)) throw invalid();
  const data = row as Record<string, unknown>;
  const strings = ['id', 'correo_actual', 'correo_nuevo', 'vence_en'].every(
    (field) => typeof data[field] === 'string',
  );
  const booleans = ['actual_confirmado', 'nuevo_confirmado'].every(
    (field) => typeof data[field] === 'boolean',
  );
  if (
    data.account_id !== accountId ||
    !strings ||
    !booleans ||
    !states.includes(String(data.estado)) ||
    !Number.isFinite(Date.parse(String(data.vence_en)))
  )
    throw invalid();
  return row as Progress;
}
function invalid() {
  return new Error(
    'No pudimos comprobar el cambio de correo. Consulta el estado antes de continuar.',
  );
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
