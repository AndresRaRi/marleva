import { randomUUID } from 'node:crypto';
export const owner = '11111111-1111-4111-8111-111111111111';
export const sellerId = '22222222-2222-4222-8222-222222222222';
export const reviewer = '33333333-3333-4333-8333-333333333333';
export const actor = { id: owner, reviewer: false, mfa: false };
export const reviewActor = { id: reviewer, reviewer: true, mfa: true };
export const seller = {
  id: sellerId,
  owner_id: owner,
  public_name: 'Cocina ficticia de ejemplo',
  membership_current: true,
  enabled: true,
  version: 1,
};
export const product = {
  title: 'Pan de plátano ficticio',
  description: 'Oferta ficticia para probar el catálogo vecinal sin operaciones reales.',
  kind: 'product',
  category: 'food',
  price_cents: 12000,
  unit: 'pieza',
  stock: 5,
  made_to_order: false,
  developments: [1, 2],
  modalities: ['delivery', 'pickup'],
  response_minutes: 60,
  preparation_minutes: 120,
  food: {
    ingredients: 'Plátano, harina, huevo y nuez',
    allergens: 'Trigo, huevo y nuez',
    storage: 'Conservar en recipiente cerrado',
  },
};
export const service = {
  ...product,
  title: 'Clase ficticia de repostería',
  kind: 'service',
  category: 'classes',
  price_cents: null,
  unit: null,
  stock: null,
  modalities: ['home', 'establishment'],
  food: null,
};
export function command(operation, extra = {}) {
  return {
    operation,
    key: randomUUID(),
    offer_id: randomUUID(),
    seller_id: sellerId,
    expected_revision: 0,
    ...extra,
  };
}
export async function seed(sql, count = 60) {
  await sql.execute(
    'INSERT INTO m3."SellerEligibility"(id,owner_id,public_name,membership_current,enabled) VALUES($1::uuid,$2::uuid,$3,true,true) ON CONFLICT(id) DO NOTHING',
    sellerId,
    owner,
    seller.public_name,
  );
  for (let i = 0; i < count; i++) {
    const offerId = randomUUID(),
      versionId = randomUUID();
    const data = i % 3 === 0 ? service : product;
    await sql.transaction(async (tx) => {
      await tx.execute(
        'INSERT INTO m3."Offer"(id,seller_id,paused,revision,updated_at) VALUES($1::uuid,$2::uuid,false,3,$3::timestamptz)',
        offerId,
        sellerId,
        '2026-10-15T12:00:00.' + String(i % 10).padStart(6, '0') + 'Z',
      );
      await tx.execute(
        `INSERT INTO m3."OfferVersion"(id,offer_id,number,state,title,description,kind,category,price_cents,unit,stock,made_to_order,developments,modalities,response_minutes,preparation_minutes,food)
    VALUES($1::uuid,$2::uuid,1,'approved',$3,$4,$5,$6,$7,$8,$9,$10,ARRAY[1,2],$11::text[],$12,$13,$14::jsonb)`,
        versionId,
        offerId,
        data.title + ' ' + i,
        data.description,
        data.kind,
        data.category,
        data.price_cents,
        data.unit,
        data.stock,
        data.made_to_order,
        data.modalities,
        data.response_minutes,
        data.preparation_minutes,
        data.food === null ? null : JSON.stringify(data.food),
      );
      await tx.execute(
        'UPDATE m3."Offer" SET public_version_id=$2::uuid WHERE id=$1::uuid',
        offerId,
        versionId,
      );
    });
  }
}
