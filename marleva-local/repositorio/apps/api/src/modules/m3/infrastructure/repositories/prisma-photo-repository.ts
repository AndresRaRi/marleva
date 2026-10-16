import type { PhotoInput, ReadyPhoto } from '../../domain/photo.js';
import { fail } from '../../domain/catalog.js';
import type { Actor } from '../../domain/offer-transition.js';
import type { PhotoRepository } from '../../application/ports/photos.js';
import type { TransactionalSql, Sql } from '../sql.js';
interface Draft {
  owner_id: string;
  enabled: boolean;
  membership_current: boolean;
  state: string;
}
async function draft(sql: Sql, versionId: string, actor: Actor): Promise<void> {
  const rows = await sql.query<Draft>(
    `SELECT s.owner_id,s.enabled,s.membership_current,v.state
   FROM m3."OfferVersion" v JOIN m3."Offer" o ON o.id=v.offer_id
   JOIN m3."SellerEligibility" s ON s.id=o.seller_id WHERE v.id=$1::uuid
   FOR UPDATE OF o,v FOR SHARE OF s`,
    versionId,
  );
  const row = rows[0];
  if (!row || row.owner_id !== actor.id) fail('NOT_FOUND', 'Esta versión no está disponible.', 404);
  if (!row.enabled || !row.membership_current)
    fail('NOT_ELIGIBLE', 'El oferente no está habilitado.', 403);
  if (row.state !== 'draft') fail('PHOTO_STATE', 'Las fotos solo se añaden al borrador.', 409);
}
async function existing(
  sql: Sql,
  id: string,
  versionId: string,
  position: number,
  hash: string,
): Promise<ReadyPhoto | null> {
  const rows = await sql.query<ReadyPhoto>(
    'SELECT id,version_id,position,source_sha256,derivatives FROM m3."Photo" WHERE id=$1::uuid',
    id,
  );
  const row = rows[0];
  if (
    row &&
    (row.version_id !== versionId || row.position !== position || row.source_sha256 !== hash)
  )
    fail('PHOTO_KEY', 'La clave ya se utilizó con otra foto.', 409);
  if (row) return row;
  const occupied = await sql.query<{ id: string }>(
    'SELECT id FROM m3."Photo" WHERE version_id=$1::uuid AND position=$2',
    versionId,
    position,
  );
  if (occupied.length) fail('PHOTO_POSITION', 'Esta posición ya contiene una foto.', 409);
  return null;
}
export class PrismaPhotoRepository implements PhotoRepository {
  constructor(private readonly database: TransactionalSql) {}
  check(input: PhotoInput, actor: Actor, hash: string): Promise<ReadyPhoto | null> {
    return this.database.transaction(async (sql) => {
      await draft(sql, input.version_id, actor);
      return existing(sql, input.id, input.version_id, input.position, hash);
    });
  }
  attach(photo: ReadyPhoto, actor: Actor): Promise<ReadyPhoto> {
    return this.database.transaction(async (sql) => {
      await draft(sql, photo.version_id, actor);
      const previous = await existing(
        sql,
        photo.id,
        photo.version_id,
        photo.position,
        photo.source_sha256,
      );
      if (previous) return previous;
      await sql.execute(
        `INSERT INTO m3."Photo"(id,version_id,position,state,object_key,mime_type,bytes,sha256,metadata_removed,source_sha256,derivatives)
       VALUES($1::uuid,$2::uuid,$3,'ready',$1::uuid::text,'image/jpeg',$4,$5,true,$6,$7::jsonb)`,
        photo.id,
        photo.version_id,
        photo.position,
        photo.derivatives.detail.bytes,
        photo.derivatives.detail.sha256,
        photo.source_sha256,
        JSON.stringify(photo.derivatives),
      );
      return photo;
    });
  }
}
