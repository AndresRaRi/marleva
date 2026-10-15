import { createHash } from 'node:crypto';
import { transition, type Actor, type Command } from '../../domain/offer-transition.js';
import type { OfferRepository } from '../ports/offer-repository.js';
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, canonical(item)]),
  );
}
export class ChangeOffer {
  constructor(private readonly repository: OfferRepository) {}
  execute(command: Command, actor: Actor) {
    const hash = createHash('sha256')
      .update(JSON.stringify(canonical(command)))
      .digest('hex');
    return this.repository.change(command, actor, hash, (current, seller) =>
      transition(current, seller, command, actor),
    );
  }
}
