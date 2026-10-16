import type { Actor } from '../../domain/offer-transition.js';
import type { OfferData, Filters } from '../../domain/catalog.js';
import type { Boundary } from '../../domain/catalog-cursor.js';
import type { ReadyPhoto } from '../../domain/photo.js';
interface ManagedVersion extends OfferData {
  id: string;
  number: number;
  state: string;
  reason: string | null;
  photos: { id: string; position: number }[];
}
export interface ManagedOffer {
  id: string;
  seller_id: string;
  revision: number;
  paused: boolean;
  public_version_id: string | null;
  versions: ManagedVersion[];
}
export interface ManagedQuery {
  scope: 'own' | 'review';
  limit: number;
  cursor?: string;
}
export interface ManagedOffers {
  list(
    actor: Actor,
    query: ManagedQuery,
    boundary: Boundary | null,
  ): Promise<{ offer: ManagedOffer; boundary: Boundary }[]>;
  context(actor: Actor): Promise<{ id: string; name: string }[]>;
  detail(id: string, actor: Actor): Promise<ManagedOffer>;
  photo(
    offerId: string,
    photoId: string,
    actor: Actor,
  ): Promise<Pick<ReadyPhoto, 'id' | 'derivatives'> | null>;
}
export function managedFilters(actor: Actor, query: ManagedQuery): Filters {
  return { seller_id: actor.id, q: 'managed:' + query.scope };
}
