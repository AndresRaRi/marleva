import { beforeAll, afterAll, it, expect } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { connectM3 } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/prisma-sql.js';
import { createM3 } from '../../../../apps/api/dist-m3/m3-main.js';
import { PrismaOfferRepository } from '../../../../apps/api/src/modules/m3/infrastructure/repositories/prisma-offer-repository.ts';
import { ChangeOffer } from '../../../../apps/api/src/modules/m3/application/use-cases/change-offer.ts';
import {
  seed,
  product,
  actor,
  reviewActor,
  sellerId,
  command,
} from '../../../fixtures/m3-fixtures.mjs';
let db, api, app, change;
beforeAll(async () => {
  if (process.env.MARLEVA_M3_CHECK !== '1')
    throw Error('Solo ensayo M3 explícito en destino55432.');
  db = connectM3(true);
  api = connectM3();
  await seed(db.sql, 60);
  change = new ChangeOffer(new PrismaOfferRepository(db.sql));
  app = await createM3(api.sql);
  await app.listen(0, '127.0.0.1');
}, 60000);
afterAll(async () => {
  await app?.close();
  await api?.client.$disconnect();
  await db?.client.$disconnect();
});
it('MAR-M3-IT-BE-001 | PG/Nest públicos: empates, microsegundos y páginas completas', async () => {
  const ids = [];
  let cursor = null;
  do {
    const result = await request(app.getHttpServer())
      .get('/v1/catalog/offers')
      .query({ limit: 7, ...(cursor ? { cursor } : {}) })
      .expect(200);
    expect(result.headers['cache-control']).toBe('no-store');
    ids.push(...result.body.items.map((item) => item.id));
    cursor = result.body.next_cursor;
  } while (cursor);
  const count = await db.sql.query('SELECT count(*)::int AS n FROM m3."Offer" WHERE NOT paused');
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.length).toBe(count[0].n);
});
it('MAR-M3-IT-BE-001-F | todos los filtros, entrada repetida y SQL literal', async () => {
  const result = await request(app.getHttpServer())
    .get('/v1/catalog/offers')
    .query({
      q: 'Pan',
      kind: 'product',
      category: 'food',
      development: 2,
      modality: 'pickup',
      limit: 50,
    })
    .expect(200);
  expect(result.body.items.length).toBeGreaterThan(0);
  for (const item of result.body.items)
    expect(item).toMatchObject({ kind: 'product', category: 'food' });
  await request(app.getHttpServer()).get('/v1/catalog/offers?limit=1&limit=2').expect(422);
  await request(app.getHttpServer()).get('/v1/catalog/offers?unknown=x').expect(422);
  const injection = await request(app.getHttpServer())
    .get('/v1/catalog/offers')
    .query({ q: "%' OR 1=1 --" })
    .expect(200);
  expect(injection.body.items).toEqual([]);
});
it('MAR-M3-IT-BE-002/003 | proyección pública y ocultación inmediata por elegibilidad', async () => {
  const list = await request(app.getHttpServer()).get('/v1/catalog/offers').expect(200);
  const id = list.body.items[0].id;
  const detail = await request(app.getHttpServer())
    .get('/v1/catalog/offers/' + id)
    .expect(200);
  expect(JSON.stringify(detail.body)).not.toMatch(
    /owner_id|reviewed_by|reason|membership|email|address/,
  );
  const seller = await request(app.getHttpServer())
    .get('/v1/catalog/sellers/' + sellerId)
    .expect(200);
  expect(Object.keys(seller.body).sort()).toEqual(['id', 'name']);
  await db.sql.execute(
    'UPDATE m3."SellerEligibility" SET enabled=false WHERE id=$1::uuid',
    sellerId,
  );
  try {
    expect(
      (await request(app.getHttpServer()).get('/v1/catalog/offers').expect(200)).body.items,
    ).toEqual([]);
    await request(app.getHttpServer())
      .get('/v1/catalog/offers/' + id)
      .expect(404);
    await request(app.getHttpServer())
      .get('/v1/catalog/sellers/' + sellerId)
      .expect(404);
  } finally {
    await db.sql.execute(
      'UPDATE m3."SellerEligibility" SET enabled=true WHERE id=$1::uuid',
      sellerId,
    );
  }
});
it('MAR-M3-IT-BE-004/005/006 | commit/recibo/concurrencia y revisión única', async () => {
  const create = command('create', { data: product });
  const [a, b] = await Promise.all([change.execute(create, actor), change.execute(create, actor)]);
  expect(a).toEqual(b);
  await expect(
    change.execute({ ...create, data: { ...product, price_cents: 100 } }, actor),
  ).rejects.toMatchObject({ status: 409 });
  await request(app.getHttpServer())
    .get('/v1/catalog/offers/' + a.id)
    .expect(404);
  const submitted = await change.execute(
    {
      ...create,
      operation: 'submit',
      key: randomUUID(),
      expected_revision: 1,
      version_id: a.version_id,
    },
    actor,
  );
  const review = {
    ...create,
    operation: 'decide',
    key: randomUUID(),
    expected_revision: submitted.revision,
    version_id: a.version_id,
    decision: 'approved',
    reason: 'Fixture revisado',
  };
  const results = await Promise.allSettled([
    change.execute(review, reviewActor),
    change.execute({ ...review, key: randomUUID() }, reviewActor),
  ]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.find((result) => result.status === 'rejected').reason.status).toBe(409);
  const detail = await request(app.getHttpServer())
    .get('/v1/catalog/offers/' + a.id)
    .expect(200);
  expect(detail.body.price_cents).toBe(12000);
  const events = await db.sql.query(
    'SELECT count(*)::int AS n FROM m3."CatalogEvent" WHERE offer_id=$1::uuid',
    a.id,
  );
  expect(events[0].n).toBe(3);
  const edited = await change.execute(
    {
      ...create,
      operation: 'edit',
      key: randomUUID(),
      expected_revision: 3,
      data: { ...product, price_cents: 13000 },
    },
    actor,
  );
  expect(
    (
      await request(app.getHttpServer())
        .get('/v1/catalog/offers/' + a.id)
        .expect(200)
    ).body.price_cents,
  ).toBe(12000);
  await change.execute(
    { ...create, operation: 'pause', key: randomUUID(), expected_revision: edited.revision },
    actor,
  );
  await request(app.getHttpServer())
    .get('/v1/catalog/offers/' + a.id)
    .expect(404);
});
it('MAR-M3-IT-BE-004-N | rol HTTP solo lectura y ninguna ruta de rol ficticio', async () => {
  await expect(
    api.sql.execute('UPDATE m3."SellerEligibility" SET enabled=false'),
  ).rejects.toThrow();
  await expect(api.sql.query('SELECT owner_id FROM m3."SellerEligibility"')).rejects.toThrow();
  await expect(api.sql.query('SELECT * FROM m3."CommandReceipt"')).rejects.toThrow();
  await request(app.getHttpServer())
    .post('/v1/offers')
    .set('x-actor-id', actor.id)
    .send(product)
    .expect(404);
  await expect(
    change.execute(command('create', { data: product }), reviewActor),
  ).rejects.toMatchObject({ status: 404 });
});
it('MAR-M3-IT-BE-004-DB | DB rechaza stock negativo y no persiste transición parcial', async () => {
  const created = await change.execute(command('create', { data: product }), actor);
  await expect(
    db.sql.execute('UPDATE m3."OfferVersion" SET stock=-1 WHERE id=$1::uuid', created.version_id),
  ).rejects.toThrow();
  const rows = await db.sql.query(
    'SELECT stock FROM m3."OfferVersion" WHERE id=$1::uuid',
    created.version_id,
  );
  expect(rows[0].stock).toBe(5);
});
