import type { ApiResponse } from '../../api-response';
export function factorResponse(value: unknown): ApiResponse<'MAR_M1_API_027'>['items'] {
  if (
    !value ||
    typeof value !== 'object' ||
    !('items' in value) ||
    !Array.isArray(value.items) ||
    value.items.length > 50
  )
    throw invalid();
  return value.items.map((row: unknown) => {
    if (!row || typeof row !== 'object') throw invalid();
    const data = row as Record<string, unknown>;
    if (
      typeof data.id !== 'string' ||
      typeof data.nombre !== 'string' ||
      !['verified', 'unverified'].includes(String(data.estado))
    )
      throw invalid();
    return { id: data.id, nombre: data.nombre, estado: data.estado as 'verified' | 'unverified' };
  });
}
function invalid() {
  return new Error('No pudimos comprobar tus factores. Consulta de nuevo.');
}
