import {
  publicData,
  type CatalogQuery,
  type OfferData,
  type PublicSeller,
} from '../../domain/catalog.js';
import type { Boundary } from '../../domain/catalog-cursor.js';
import type { CatalogRepository, CatalogRow } from '../../application/ports/catalog-repository.js';
import type { Sql } from '../sql.js';
interface Row extends OfferData {
  offer_id: string;
  version_id: string;
  number: number;
  seller_id: string;
  public_name: string;
  at: string;
}
const select = `SELECT o.id AS offer_id,v.id AS version_id,v.number,v.title,v.description,
 v.kind,v.category,v.price_cents,v.unit,v.stock,v.made_to_order,v.developments,v.modalities,
 v.response_minutes,v.preparation_minutes,v.food,s.id AS seller_id,s.public_name,
 to_char(o.updated_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS at
 FROM m3."Offer" o JOIN m3."SellerEligibility" s ON s.id=o.seller_id
 JOIN m3."OfferVersion" v ON v.id=o.public_version_id AND v.offer_id=o.id
 WHERE NOT o.paused AND s.enabled AND s.membership_current AND v.state='approved'`;
function project(row: Row): CatalogRow {
  return {
    boundary: { at: row.at, id: row.offer_id },
    offer: {
      ...publicData(row),
      id: row.offer_id,
      version_id: row.version_id,
      version: row.number,
      seller: { id: row.seller_id, name: row.public_name },
      photos: [],
      updated_at: row.at,
    },
  };
}
function conditions(query: CatalogQuery, boundary: Boundary | null) {
  const clauses: string[] = [];
  const values: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    values.push(value);
    clauses.push(clause.replace('?', '$' + values.length));
  };
  if (query.q)
    add(
      "(v.title || ' ' || v.description) ILIKE ? ESCAPE '\\'",
      '%' + query.q.replace(/[\\%_]/gu, '\\$&') + '%',
    );
  if (query.category) add('v.category=?', query.category);
  if (query.kind) add('v.kind=?', query.kind);
  if (query.development) add('?::integer=ANY(v.developments)', query.development);
  if (query.modality) add('?=ANY(v.modalities)', query.modality);
  if (query.seller_id) add('o.seller_id=?::uuid', query.seller_id);
  if (boundary) {
    values.push(boundary.at, boundary.id);
    clauses.push(
      `(o.updated_at,o.id)<($${values.length - 1}::timestamptz,$${values.length}::uuid)`,
    );
  }
  values.push(query.limit + 1);
  return {
    suffix:
      clauses.map((clause) => ' AND ' + clause).join('') +
      ` ORDER BY o.updated_at DESC,o.id DESC LIMIT $${values.length}::integer`,
    values,
  };
}
export class PrismaCatalogRepository implements CatalogRepository {
  constructor(private readonly sql: Sql) {}
  async list(query: CatalogQuery, boundary: Boundary | null): Promise<CatalogRow[]> {
    const { suffix, values } = conditions(query, boundary);
    return (await this.sql.query<Row>(select + suffix, ...values)).map(project);
  }
  async detail(id: string) {
    const rows = await this.sql.query<Row>(select + ' AND o.id=$1::uuid', id);
    return rows[0] ? project(rows[0]).offer : null;
  }
  async seller(id: string): Promise<PublicSeller | null> {
    const rows = await this.sql.query<PublicSeller>(
      'SELECT id,public_name AS name FROM m3."SellerEligibility" WHERE id=$1::uuid AND enabled AND membership_current',
      id,
    );
    return rows[0] ?? null;
  }
}
