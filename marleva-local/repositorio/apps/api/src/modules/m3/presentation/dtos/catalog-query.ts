import { categories, modalities, type CatalogQuery } from '../../domain/catalog.js';
import { object, keys, string, integer, choice, uuid } from './validation.js';
function queryInteger(value: unknown, min: number, max: number): number {
  const text = string(value, 1, 10);
  if (!/^\d+$/u.test(text)) return integer(Number.NaN, min, max);
  return integer(Number(text), min, max);
}
export function parseQuery(value: unknown): CatalogQuery {
  const data = object(value);
  keys(data, ['q', 'category', 'kind', 'development', 'modality', 'seller_id', 'limit', 'cursor']);
  const query: CatalogQuery = {
    limit: data.limit === undefined ? 24 : queryInteger(data.limit, 1, 50),
  };
  if (data.q !== undefined) query.q = string(data.q, 0, 120);
  if (data.category !== undefined) query.category = choice(data.category, categories);
  if (data.kind !== undefined) query.kind = choice(data.kind, ['product', 'service'] as const);
  if (data.development !== undefined) query.development = queryInteger(data.development, 1, 7);
  if (data.modality !== undefined) query.modality = choice(data.modality, modalities);
  if (data.seller_id !== undefined) query.seller_id = uuid(data.seller_id);
  if (data.cursor !== undefined) query.cursor = string(data.cursor, 1, 2048);
  return query;
}
