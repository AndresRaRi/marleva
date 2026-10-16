import { randomUUID } from 'node:crypto';
import { fail, type Offer, type OfferVersion, type Seller } from '../../domain/catalog.js';
import { authorize, type Actor, type Command } from '../../domain/offer-transition.js';
import type { OfferRepository, CommandResult } from '../../application/ports/offer-repository.js';
import type { Sql, TransactionalSql } from '../sql.js';
interface Receipt {
  request_hash: string;
  result: CommandResult;
}
async function load(sql: Sql, id: string): Promise<Offer | null> {
  const rows = await sql.query<Omit<Offer, 'versions'>>(
    'SELECT id,seller_id,paused,revision,public_version_id FROM m3."Offer" WHERE id=$1::uuid FOR UPDATE',
    id,
  );
  if (!rows[0]) return null;
  const versions = await sql.query<OfferVersion>(
    'SELECT * FROM m3."OfferVersion" WHERE offer_id=$1::uuid ORDER BY number',
    id,
  );
  return { ...rows[0], versions };
}
async function insertVersion(sql: Sql, offer: Offer, version: OfferVersion): Promise<void> {
  await sql.execute(
    `INSERT INTO m3."OfferVersion"(id,offer_id,number,state,title,description,kind,category,
   price_cents,unit,stock,made_to_order,developments,modalities,response_minutes,preparation_minutes,food,reason,reviewed_by)
   VALUES($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::integer[],$14::text[],$15,$16,$17::jsonb,$18,$19::uuid)`,
    version.id,
    offer.id,
    version.number,
    version.state,
    version.title,
    version.description,
    version.kind,
    version.category,
    version.price_cents,
    version.unit,
    version.stock,
    version.made_to_order,
    version.developments,
    version.modalities,
    version.response_minutes,
    version.preparation_minutes,
    version.food === null ? null : JSON.stringify(version.food),
    version.reason,
    version.reviewed_by,
  );
}
async function persist(sql: Sql, before: Offer | null, offer: Offer): Promise<void> {
  if (!before)
    await sql.execute(
      'INSERT INTO m3."Offer"(id,seller_id) VALUES($1::uuid,$2::uuid)',
      offer.id,
      offer.seller_id,
    );
  for (const version of offer.versions) {
    const old = before?.versions.find((item) => item.id === version.id);
    if (!old) await insertVersion(sql, offer, version);
    else if (old.state !== version.state)
      await sql.execute(
        'UPDATE m3."OfferVersion" SET state=$2,reason=$3,reviewed_by=$4::uuid WHERE id=$1::uuid',
        version.id,
        version.state,
        version.reason,
        version.reviewed_by,
      );
  }
  await sql.execute(
    'UPDATE m3."Offer" SET paused=$2,revision=$3,public_version_id=$4::uuid,updated_at=clock_timestamp() WHERE id=$1::uuid',
    offer.id,
    offer.paused,
    offer.revision,
    offer.public_version_id,
  );
}
function result(offer: Offer): CommandResult {
  const version = offer.versions.at(-1);
  if (!version) throw Error('Missing version');
  return { id: offer.id, revision: offer.revision, version_id: version.id, state: version.state };
}
export class PrismaOfferRepository implements OfferRepository {
  constructor(private readonly database: TransactionalSql) {}
  change(
    command: Command,
    actor: Actor,
    hash: string,
    decide: (current: Offer | null, seller: Seller) => Offer,
  ): Promise<CommandResult> {
    return this.database.transaction(async (sql) => {
      await sql.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1,0))::text',
        actor.id + command.key + command.operation,
      );
      const sellers = await sql.query<Seller>(
        'SELECT * FROM m3."SellerEligibility" WHERE id=$1::uuid FOR SHARE',
        command.seller_id,
      );
      const seller = sellers[0] ?? fail('NOT_FOUND', 'El oferente no está disponible.', 404);
      authorize(actor, seller, command.operation);
      const receipts = await sql.query<Receipt>(
        'SELECT request_hash,result FROM m3."CommandReceipt" WHERE actor_id=$1::uuid AND key=$2::uuid AND operation=$3',
        actor.id,
        command.key,
        command.operation,
      );
      const receipt = receipts[0];
      if (receipt && receipt.request_hash !== hash)
        fail('IDEMPOTENCY', 'La clave ya se utilizó con otros datos.', 409);
      if (receipt) return receipt.result;
      const before = await load(sql, command.offer_id);
      const offer = decide(before, seller);
      await persist(sql, before, offer);
      const output = result(offer);
      await sql.execute(
        'INSERT INTO m3."CatalogEvent"(id,offer_id,actor_id,action,revision) VALUES($1::uuid,$2::uuid,$3::uuid,$4,$5)',
        randomUUID(),
        offer.id,
        actor.id,
        command.operation,
        offer.revision,
      );
      await sql.execute(
        'INSERT INTO m3."CommandReceipt"(actor_id,key,operation,request_hash,result) VALUES($1::uuid,$2::uuid,$3,$4,$5::jsonb)',
        actor.id,
        command.key,
        command.operation,
        hash,
        JSON.stringify(output),
      );
      return output;
    });
  }
}
