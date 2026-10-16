import type { Offer, Seller } from '../../domain/catalog.js';
import type { Actor, Command } from '../../domain/offer-transition.js';
export interface CommandResult {
  id: string;
  revision: number;
  version_id: string;
  state: string;
}
export interface OfferRepository {
  change(
    command: Command,
    actor: Actor,
    hash: string,
    decide: (current: Offer | null, seller: Seller) => Offer,
  ): Promise<CommandResult>;
}
