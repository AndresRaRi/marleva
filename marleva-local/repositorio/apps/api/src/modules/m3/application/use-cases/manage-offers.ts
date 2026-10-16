import type { Actor, Command } from '../../domain/offer-transition.js';
import { fail } from '../../domain/catalog.js';
import { decodeCursor, encodeCursor } from '../../domain/catalog-cursor.js';
import { managedFilters, type ManagedOffers, type ManagedQuery } from '../ports/managed-offers.js';
import type { PhotoInput } from '../../domain/photo.js';
import { ChangeOffer } from './change-offer.js';
import { AttachPhoto } from './attach-photo.js';
import { ReadPhoto } from './read-photo.js';
import type { PhotoStore } from '../ports/photos.js';
export class ManageOffers {
  constructor(
    private readonly offers: ManagedOffers,
    private readonly change: ChangeOffer,
    private readonly photos: AttachPhoto,
    private readonly store: PhotoStore,
  ) {}
  async list(actor: Actor, query: ManagedQuery) {
    const filters = managedFilters(actor, query),
      rows = await this.offers.list(actor, query, decodeCursor(query.cursor, filters));
    const page = rows.slice(0, query.limit),
      last = page.at(-1);
    return {
      items: page.map((row) => row.offer),
      next_cursor: rows.length > query.limit && last ? encodeCursor(last.boundary, filters) : null,
    };
  }
  context(actor: Actor) {
    return this.offers.context(actor);
  }
  detail(id: string, actor: Actor) {
    return this.offers.detail(id, actor);
  }
  async execute(command: Command, actor: Actor) {
    if (command.operation !== 'create') {
      const offer = await this.offers.detail(command.offer_id, actor);
      if (offer.seller_id !== command.seller_id)
        fail('NOT_FOUND', 'Esta oferta no está disponible.', 404);
    }
    return this.change.execute(command, actor);
  }
  async attach(offerId: string, input: PhotoInput, actor: Actor) {
    const offer = await this.offers.detail(offerId, actor);
    if (!offer.versions.some((version) => version.id === input.version_id))
      fail('NOT_FOUND', 'Esta versión no está disponible.', 404);
    const ready = await this.photos.execute(input, actor);
    return { id: ready.id, version_id: ready.version_id, position: ready.position };
  }
  async readPhoto(offerId: string, id: string, size: 'card' | 'detail', actor: Actor) {
    return new ReadPhoto({ find: () => this.offers.photo(offerId, id, actor) }, this.store).execute(
      id,
      size,
    );
  }
}
