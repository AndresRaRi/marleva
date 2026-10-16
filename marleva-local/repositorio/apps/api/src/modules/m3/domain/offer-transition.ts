import { randomUUID } from 'node:crypto';
import {
  eligible,
  fail,
  type Offer,
  type OfferData,
  type OfferVersion,
  type Seller,
} from './catalog.js';
export interface Actor {
  id: string;
  reviewer: boolean;
  mfa: boolean;
}
export interface Command {
  operation: 'create' | 'edit' | 'submit' | 'decide' | 'pause';
  key: string;
  offer_id: string;
  seller_id: string;
  expected_revision: number;
  data?: OfferData;
  version_id?: string;
  decision?: 'approved' | 'correction' | 'rejected';
  reason?: string;
}
function newVersion(data: OfferData, number: number): OfferVersion {
  return {
    ...structuredClone(data),
    id: randomUUID(),
    number,
    state: 'draft',
    reason: null,
    reviewed_by: null,
  };
}
export function authorize(actor: Actor, seller: Seller, operation: Command['operation']): void {
  if (!eligible(seller)) fail('NOT_ELIGIBLE', 'El oferente no está habilitado.', 403);
  if (operation !== 'decide' && actor.id !== seller.owner_id)
    fail('NOT_FOUND', 'La oferta no está disponible.', 404);
  if (operation === 'decide' && (!actor.reviewer || !actor.mfa || actor.id === seller.owner_id)) {
    fail('REVIEW_PERMISSION', 'Se necesita otro revisor autorizado con segundo factor.', 403);
  }
}
function edit(offer: Offer, command: Command): void {
  if (!command.data) fail('FIELDS', 'Faltan los datos de la oferta.');
  if (offer.versions.some((version) => version.state === 'pending'))
    fail('STATE', 'Espera la revisión pendiente.', 409);
  const previous = offer.versions.at(-1);
  offer.versions.push(newVersion(command.data, (previous?.number ?? 0) + 1));
  if (
    previous?.stock !== command.data.stock ||
    previous?.made_to_order !== command.data.made_to_order
  )
    offer.paused = true;
}
function submit(offer: Offer, command: Command): void {
  const version = offer.versions.at(-1);
  if (!version || version.id !== command.version_id || version.state !== 'draft')
    fail('STATE', 'Actualiza la versión de la oferta.', 409);
  version.state = 'pending';
}
function decide(offer: Offer, command: Command, actor: Actor): void {
  const version = offer.versions.find((item) => item.id === command.version_id);
  if (!version || version.state !== 'pending' || !command.decision)
    fail('STATE', 'Esta versión ya no está pendiente.', 409);
  if (!['approved', 'correction', 'rejected'].includes(command.decision))
    fail('FIELDS', 'Decisión inválida.');
  if (!command.reason?.trim() || command.reason.length > 500)
    fail('FIELDS', 'Indica un motivo de hasta 500 caracteres.');
  version.state = command.decision;
  version.reason = command.reason.trim();
  version.reviewed_by = actor.id;
  if (command.decision === 'approved') {
    offer.public_version_id = version.id;
    offer.paused = false;
  }
}
function create(current: Offer | null, seller: Seller, command: Command): Offer {
  if (current || command.expected_revision !== 0 || !command.data)
    fail('STATE', 'La oferta ya existe o está incompleta.', 409);
  return {
    id: command.offer_id,
    seller_id: seller.id,
    paused: true,
    revision: 1,
    public_version_id: null,
    versions: [newVersion(command.data, 1)],
  };
}
export function transition(
  current: Offer | null,
  seller: Seller,
  command: Command,
  actor: Actor,
): Offer {
  authorize(actor, seller, command.operation);
  if (command.operation === 'create') return create(current, seller, command);
  if (!current || current.seller_id !== seller.id)
    fail('NOT_FOUND', 'La oferta no está disponible.', 404);
  if (current.revision !== command.expected_revision)
    fail('VERSION', 'La oferta cambió. Actualízala.', 409);
  const offer = structuredClone(current);
  switch (command.operation) {
    case 'edit':
      edit(offer, command);
      break;
    case 'submit':
      submit(offer, command);
      break;
    case 'decide':
      decide(offer, command, actor);
      break;
    case 'pause':
      offer.paused = true;
      break;
  }
  offer.revision++;
  return offer;
}
