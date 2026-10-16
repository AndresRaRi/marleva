import { publicData, fail, type OfferData } from '../../domain/catalog.js';
import type { Actor } from '../../domain/offer-transition.js';
import type { Boundary } from '../../domain/catalog-cursor.js';
import type {
  ManagedOffer,
  ManagedOffers,
  ManagedQuery,
} from '../../application/ports/managed-offers.js';
import type { ReadyPhoto } from '../../domain/photo.js';
import type { Sql } from '../sql.js';
interface Row extends Omit<ManagedOffer, 'versions'> {
  at: string;
}
interface Version extends OfferData {
  id: string;
  offer_id: string;
  number: number;
  state: string;
  reason: string | null;
  photos: { id: string; position: number }[];
}
const base = `SELECT o.id,o.seller_id,o.revision,o.paused,o.public_version_id,to_char(o.updated_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS at FROM m3."Offer" o JOIN m3."SellerEligibility" s ON s.id=o.seller_id WHERE s.enabled AND s.membership_current`;
const access = ` AND (s.owner_id=$1::uuid OR ($2::boolean AND s.owner_id<>$1::uuid))`;
function review(actor: Actor): boolean {
  return actor.reviewer && actor.mfa;
}
function project(row: Row, versions: Version[]): ManagedOffer {
  return {
    id: row.id,
    seller_id: row.seller_id,
    revision: row.revision,
    paused: row.paused,
    public_version_id: row.public_version_id,
    versions: versions
      .filter((v) => v.offer_id === row.id)
      .map((v) => ({
        ...publicData(v),
        id: v.id,
        number: v.number,
        state: v.state,
        reason: v.reason,
        photos: v.photos,
      })),
  };
}
export class PrismaManagedOffers implements ManagedOffers {
  constructor(private readonly sql: Sql) {}
  private async versions(ids: string[]): Promise<Version[]> {
    if (!ids.length) return [];
    return this.sql.query<Version>(
      `SELECT v.id,v.offer_id,v.number,v.state,v.reason,v.title,v.description,v.kind,v.category,v.price_cents,v.unit,v.stock,v.made_to_order,v.developments,v.modalities,v.response_minutes,v.preparation_minutes,v.food,COALESCE((SELECT jsonb_agg(jsonb_build_object('id',p.id,'position',p.position) ORDER BY p.position) FROM m3."Photo" p WHERE p.version_id=v.id AND p.state='ready' AND p.metadata_removed),'[]'::jsonb) AS photos FROM m3."OfferVersion" v WHERE v.offer_id=ANY($1::uuid[]) ORDER BY v.number`,
      ids,
    );
  }
  async list(actor: Actor, query: ManagedQuery, boundary: Boundary | null) {
    const queue = query.scope === 'review';
    if (queue && !review(actor))
      fail('REVIEW_PERMISSION', 'Se necesita un revisor con segundo factor.', 403);
    const condition = queue
      ? ` AND s.owner_id<>$1::uuid AND EXISTS(SELECT 1 FROM m3."OfferVersion" pending WHERE pending.offer_id=o.id AND pending.state='pending')`
      : ` AND s.owner_id=$1::uuid`;
    const rows = await this.sql.query<Row>(
      base +
        condition +
        ` AND ($2::timestamptz IS NULL OR (o.updated_at,o.id)<($2::timestamptz,$3::uuid)) ORDER BY o.updated_at DESC,o.id DESC LIMIT $4::integer`,
      actor.id,
      boundary?.at ?? null,
      boundary?.id ?? null,
      query.limit + 1,
    );
    const versions = await this.versions(rows.map((row) => row.id));
    return rows.map((row) => ({
      offer: project(row, versions),
      boundary: { at: row.at, id: row.id },
    }));
  }
  context(actor: Actor) {
    return this.sql.query<{ id: string; name: string }>(
      'SELECT id,public_name AS name FROM m3."SellerEligibility" WHERE owner_id=$1::uuid AND enabled AND membership_current ORDER BY id',
      actor.id,
    );
  }
  async detail(id: string, actor: Actor): Promise<ManagedOffer> {
    const rows = await this.sql.query<Row>(
      base + access + ' AND o.id=$3::uuid',
      actor.id,
      review(actor),
      id,
    );
    if (!rows[0]) fail('NOT_FOUND', 'Esta oferta no está disponible.', 404);
    return project(rows[0], await this.versions([id]));
  }
  async photo(offerId: string, photoId: string, actor: Actor) {
    const rows = await this.sql.query<Pick<ReadyPhoto, 'id' | 'derivatives'>>(
      `SELECT p.id,p.derivatives FROM m3."Photo" p JOIN m3."OfferVersion" v ON v.id=p.version_id JOIN m3."Offer" o ON o.id=v.offer_id JOIN m3."SellerEligibility" s ON s.id=o.seller_id WHERE p.id=$3::uuid AND o.id=$4::uuid AND p.state='ready' AND p.metadata_removed AND s.enabled AND s.membership_current` +
        access,
      actor.id,
      review(actor),
      photoId,
      offerId,
    );
    return rows[0] ?? null;
  }
}
