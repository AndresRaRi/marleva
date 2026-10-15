import { fail, type CatalogQuery, type Page } from '../../domain/catalog.js';
import { decodeCursor, encodeCursor } from '../../domain/catalog-cursor.js';
import type { CatalogRepository } from '../ports/catalog-repository.js';
export class ReadCatalog {
  constructor(private readonly repository: CatalogRepository) {}
  async list(query: CatalogQuery): Promise<Page> {
    const rows = await this.repository.list(query, decodeCursor(query.cursor, query));
    const visible = rows.slice(0, query.limit);
    const last = visible.at(-1);
    return {
      items: visible.map((row) => row.offer),
      next_cursor: rows.length > query.limit && last ? encodeCursor(last.boundary, query) : null,
    };
  }
  async detail(id: string) {
    const offer = await this.repository.detail(id);
    return offer ?? fail('NOT_FOUND', 'Esta oferta no está disponible.', 404);
  }
  async seller(id: string) {
    const seller = await this.repository.seller(id);
    return seller ?? fail('NOT_FOUND', 'Este perfil no está disponible.', 404);
  }
}
