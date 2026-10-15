import type { components } from './generated/api';
export type CatalogOffer = components['schemas']['Offer'];
export type CatalogPage = components['schemas']['Page'];
export interface Search {
  q?: string;
  category?: string;
  development?: string;
  modality?: string;
  kind?: string;
  seller_id?: string;
}
class CatalogFailure extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new CatalogFailure('No pudimos leer el catálogo. Vuelve a intentar.', 503);
  return value as Record<string, unknown>;
}
function validateShape(row: Record<string, unknown>): void {
  const seller = record(row.seller);
  const strings = ['id', 'version_id', 'title', 'description', 'category', 'updated_at'];
  if (
    strings.some((key) => typeof row[key] !== 'string') ||
    typeof seller.id !== 'string' ||
    typeof seller.name !== 'string'
  )
    throw new CatalogFailure('La oferta recibida está incompleta.', 503);
  if (
    !['product', 'service'].includes(String(row.kind)) ||
    !Array.isArray(row.developments) ||
    !Array.isArray(row.modalities) ||
    !Array.isArray(row.photos)
  )
    throw new CatalogFailure('La oferta recibida está incompleta.', 503);
}
function validatePricing(row: Record<string, unknown>): void {
  if (
    row.kind === 'product' &&
    (!Number.isSafeInteger(row.price_cents) || Number(row.price_cents) <= 0)
  )
    throw new CatalogFailure('El precio recibido no es válido.', 503);
  if (row.kind === 'service' && row.price_cents !== null)
    throw new CatalogFailure('El servicio requiere cotización.', 503);
}
export function parseOffer(value: unknown): CatalogOffer {
  const row = record(value);
  validateShape(row);
  validatePricing(row);
  if (
    typeof row.made_to_order !== 'boolean' ||
    !Number.isSafeInteger(row.version) ||
    !Number.isSafeInteger(row.response_minutes) ||
    !Number.isSafeInteger(row.preparation_minutes)
  )
    throw new CatalogFailure('Datos incompletos.', 503);
  if (
    !(row.developments as unknown[]).every(
      (item) => Number.isInteger(item) && Number(item) >= 1 && Number(item) <= 7,
    )
  )
    throw new CatalogFailure('Cobertura inválida.', 503);
  return row as unknown as CatalogOffer;
}
export function parsePage(value: unknown): CatalogPage {
  const row = record(value);
  if (
    !Array.isArray(row.items) ||
    row.items.length > 50 ||
    !(row.next_cursor === null || typeof row.next_cursor === 'string')
  )
    throw new CatalogFailure('No pudimos leer el catálogo. Vuelve a intentar.', 503);
  return { items: row.items.map(parseOffer), next_cursor: row.next_cursor };
}
export class CatalogClient {
  constructor(
    private readonly base = 'http://127.0.0.1:3103',
    private readonly transport: typeof fetch = fetch,
  ) {}
  async request(path: string, signal: AbortSignal): Promise<unknown> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    const timeout = setTimeout(abort, 8000);
    try {
      const response = await this.transport.call(globalThis, this.base + path, {
        signal: controller.signal,
        credentials: 'omit',
      });
      if (!response.ok)
        throw new CatalogFailure(
          response.status === 404
            ? 'Esta oferta ya no está disponible.'
            : 'No pudimos cargar el catálogo. Vuelve a intentar.',
          response.status,
        );
      return (await response.json()) as unknown;
    } catch (error) {
      if (error instanceof CatalogFailure || signal.aborted) throw error;
      throw new CatalogFailure(
        'No pudimos conectar con el catálogo. Tu búsqueda se conserva. Vuelve a intentar.',
        503,
      );
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
    }
  }
  async list(search: Search, cursor: string | null, signal: AbortSignal) {
    const query = new URLSearchParams(
      Object.entries(search).filter(([, value]) => value !== undefined && value !== '') as [
        string,
        string,
      ][],
    );
    if (cursor) query.set('cursor', cursor);
    return parsePage(await this.request('/v1/catalog/offers?' + query.toString(), signal));
  }
  async detail(id: string, signal: AbortSignal) {
    return parseOffer(await this.request('/v1/catalog/offers/' + encodeURIComponent(id), signal));
  }
  async seller(id: string, signal: AbortSignal) {
    const row = record(await this.request('/v1/catalog/sellers/' + encodeURIComponent(id), signal));
    if (typeof row.id !== 'string' || typeof row.name !== 'string')
      throw new CatalogFailure('No pudimos leer este perfil.', 503);
    return { id: row.id, name: row.name };
  }
}
