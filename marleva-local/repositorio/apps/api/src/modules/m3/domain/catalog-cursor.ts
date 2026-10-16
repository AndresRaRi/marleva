import { createHash } from 'node:crypto';
import { fail, type Filters } from './catalog.js';
export interface Boundary {
  at: string;
  id: string;
}
function fingerprint(filters: Filters): string {
  return createHash('sha256')
    .update(
      JSON.stringify([
        filters.q ?? '',
        filters.category ?? '',
        filters.kind ?? '',
        filters.development ?? '',
        filters.modality ?? '',
        filters.seller_id ?? '',
      ]),
    )
    .digest('hex');
}
export function encodeCursor(boundary: Boundary, filters: Filters): string {
  return Buffer.from(JSON.stringify({ v: 1, ...boundary, f: fingerprint(filters) })).toString(
    'base64url',
  );
}
function boundary(value: unknown, filters: Filters): Boundary {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('object');
  const row = value as Record<string, unknown>;
  if (
    Object.keys(row)
      .sort((a, b) => a.localeCompare(b))
      .join(',') !== 'at,f,id,v' ||
    row.v !== 1 ||
    row.f !== fingerprint(filters)
  )
    throw Error('version/filter');
  if (typeof row.id !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/u.test(row.id))
    throw Error('id');
  return { id: row.id, at: timestamp(row.at) };
}
function timestamp(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/u.test(value))
    throw Error('date');
  if (
    Number(value.slice(0, 4)) === 0 ||
    new Date(value).toISOString().slice(0, 19) !== value.slice(0, 19)
  )
    throw Error('date');
  return value;
}
export function decodeCursor(cursor: string | undefined, filters: Filters): Boundary | null {
  if (cursor === undefined) return null;
  try {
    if (cursor.length > 2048 || !/^[\w-]+$/u.test(cursor)) throw Error('format');
    return boundary(
      JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as unknown,
      filters,
    );
  } catch {
    return fail('CURSOR', 'Vuelve a iniciar la búsqueda.');
  }
}
