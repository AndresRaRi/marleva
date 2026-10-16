import type { PublicPhotoReader } from '../../application/ports/photos.js';
import type { ReadyPhoto } from '../../domain/photo.js';
import type { Sql } from '../sql.js';
export class PrismaPublicPhotoReader implements PublicPhotoReader {
  constructor(private readonly sql: Sql) {}
  async find(id: string): Promise<Pick<ReadyPhoto, 'id' | 'derivatives'> | null> {
    const rows = await this.sql.query<Pick<ReadyPhoto, 'id' | 'derivatives'>>(
      `SELECT p.id,p.derivatives FROM m3."Photo" p
     JOIN m3."OfferVersion" v ON v.id=p.version_id JOIN m3."Offer" o ON o.id=v.offer_id AND o.public_version_id=v.id
     JOIN m3."SellerEligibility" s ON s.id=o.seller_id
     WHERE p.id=$1::uuid AND p.state='ready' AND p.metadata_removed AND NOT o.paused
     AND v.state='approved' AND s.enabled AND s.membership_current`,
      id,
    );
    return rows[0] ?? null;
  }
}
