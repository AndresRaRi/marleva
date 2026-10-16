import type { CatalogQuery, PublicOffer, PublicSeller } from '../../domain/catalog.js';
import type { Boundary } from '../../domain/catalog-cursor.js';
export interface CatalogRow {
  offer: PublicOffer;
  boundary: Boundary;
}
export interface CatalogRepository {
  list(query: CatalogQuery, boundary: Boundary | null): Promise<CatalogRow[]>;
  detail(id: string): Promise<PublicOffer | null>;
  seller(id: string): Promise<PublicSeller | null>;
}
