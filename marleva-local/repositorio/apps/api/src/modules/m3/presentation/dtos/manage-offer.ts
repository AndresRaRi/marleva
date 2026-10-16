import { object, keys, uuid, integer, choice, string } from './validation.js';
import { parseOfferData } from './offer-data.js';
import type { Command } from '../../domain/offer-transition.js';
import type { ManagedQuery } from '../../application/ports/managed-offers.js';
export function managementCommand(
  operation: Command['operation'],
  raw: unknown,
  id: unknown,
  key: unknown,
  sellerId: string,
): Command {
  const data = object(raw);
  const allowed = {
    create: ['id', 'seller_id', 'data'],
    edit: ['expected_version', 'data'],
    submit: ['expected_version', 'version_id'],
    decide: ['expected_version', 'version_id', 'decision', 'reason'],
    pause: ['expected_version'],
  }[operation];
  keys(data, allowed);
  const command: Command = {
    operation,
    key: uuid(key),
    offer_id: uuid(operation === 'create' ? data.id : id),
    seller_id: uuid(operation === 'create' ? data.seller_id : sellerId),
    expected_revision:
      operation === 'create' ? 0 : integer(data.expected_version, 1, Number.MAX_SAFE_INTEGER),
  };
  if (operation === 'create' || operation === 'edit') command.data = parseOfferData(data.data);
  if (operation === 'submit' || operation === 'decide') command.version_id = uuid(data.version_id);
  if (operation === 'decide') {
    command.decision = choice(data.decision, ['approved', 'correction', 'rejected'] as const);
    command.reason = string(data.reason, 1, 500);
  }
  return command;
}
export function managedQuery(raw: unknown): ManagedQuery {
  const data = object(raw);
  keys(data, ['scope', 'limit', 'cursor']);
  const result: ManagedQuery = {
    scope: data.scope === undefined ? 'own' : choice(data.scope, ['own', 'review']),
    limit: 24,
  };
  if (data.limit !== undefined) {
    const text = string(data.limit, 1, 2);
    result.limit = integer(/^\d+$/u.test(text) ? Number(text) : Number.NaN, 1, 50);
  }
  if (data.cursor !== undefined) result.cursor = string(data.cursor, 1, 2048);
  return result;
}
