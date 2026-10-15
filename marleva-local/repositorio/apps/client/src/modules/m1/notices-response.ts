import type { ApiResponse } from '../../api-response';
type Notices = ApiResponse<'MAR_M1_API_009'>;
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function noticesResponse(value: unknown, accountId: string): Notices {
  if (!record(value) || !Array.isArray(value.items)) throw invalidResponse();
  if (value.next_cursor !== null && typeof value.next_cursor !== 'string') throw invalidResponse();
  for (const item of value.items) {
    if (!record(item) || item.accountId !== accountId) throw invalidResponse();
    if (['id', 'kind', 'text', 'createdAt'].some((field) => typeof item[field] !== 'string'))
      throw invalidResponse();
  }
  return value as Notices;
}
function invalidResponse() {
  return new Error('No pudimos consultar tus avisos. Actualiza la cuenta para intentar de nuevo.');
}
