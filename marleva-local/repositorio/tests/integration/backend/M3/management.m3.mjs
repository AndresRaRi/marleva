import { beforeAll, afterAll, it, expect } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { connectM3 } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/prisma-sql.js';
import { createM3Management } from '../../../../apps/api/dist-m3/m3-management.js';
import { createM3 } from '../../../../apps/api/dist-m3/m3-main.js';
import { FixtureIdentity } from '../../../fixtures/m3-identity.mjs';
import { seed, actor, reviewActor, product, sellerId } from '../../../fixtures/m3-fixtures.mjs';
let sql, client, app, publicApp, ownerToken, reviewToken, otherToken, identity;
const bearer = (token) => ({ Authorization: 'Bearer ' + token });
const cmd = (token, method, path, body, key = randomUUID()) => {
  const agent = request(app.getHttpServer());
  return agent[method](path).set(bearer(token)).set('Idempotency-Key', key).send(body);
};
async function create(data = product) {
  const id = randomUUID();
  const response = await cmd(ownerToken, 'post', '/v1/offers', { id, seller_id: sellerId, data });
  expect(response.status, response.text).toBe(200);
  return response.body;
}
beforeAll(async () => {
  if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Se requiere PostgreSQL exclusivo M3.');
  ({ sql, client } = connectM3(true));
  await seed(sql, 3);
  identity = new FixtureIdentity();
  ownerToken = identity.issue(actor);
  reviewToken = identity.issue(reviewActor);
  otherToken = identity.issue({ ...actor, id: randomUUID() });
  app = await createM3Management(sql, identity);
  publicApp = await createM3(sql);
});
afterAll(async () => {
  await app?.close();
  await publicApp?.close();
  await client?.$disconnect();
});
it('MAR-M3-IT-BE-004-TRANSPORT | sesión y proyección privadas; bootstrap público sin mutaciones', async () => {
  expect((await request(app.getHttpServer()).get('/v1/offers')).status).toBe(401);
  expect((await request(publicApp.getHttpServer()).post('/v1/offers').send({})).status).toBe(404);
  const response = await request(app.getHttpServer())
    .get('/v1/offers/context')
    .set(bearer(ownerToken));
  expect(response.status, response.text).toBe(200);
  expect(response.body.actor_id).toBe(actor.id);
  expect(response.body.sellers.some((s) => s.id === sellerId)).toBe(true);
  expect(response.body).not.toHaveProperty('authorization');
  expect(
    (
      await request(app.getHttpServer())
        .get('/v1/offers/context')
        .set('Authorization', 'Bearer unknown')
        .set('x-role', 'reviewer')
    ).status,
  ).toBe(401);
});
it('MAR-M3-IT-BE-004-CSRF | cookie exige origen permitido y CSRF ligado a sesión', async () => {
  const cookie = 'm3_fixture_session=' + ownerToken;
  const body = { id: randomUUID(), seller_id: sellerId, data: product };
  for (const headers of [
    {},
    { Origin: 'https://example.invalid' },
    { Origin: 'http://127.0.0.1:8103' },
    { Origin: 'http://127.0.0.1:8103', 'x-csrf-token': 'wrong' },
  ]) {
    expect(
      (
        await request(app.getHttpServer())
          .post('/v1/offers')
          .set({ Cookie: cookie, ...headers })
          .set('Idempotency-Key', randomUUID())
          .send(body)
      ).status,
    ).toBe(403);
  }
  const response = await request(app.getHttpServer())
    .post('/v1/offers')
    .set({
      Cookie: cookie,
      Origin: 'http://127.0.0.1:8103',
      'x-csrf-token': identity.sessions.get(ownerToken).csrfToken,
    })
    .set('Idempotency-Key', randomUUID())
    .send(body);
  expect(response.status, response.text).toBe(200);
});
it('MAR-M3-IT-BE-004-IDEMPOTENCY | repetición, cuerpo cambiado, dueño ajeno y CAS', async () => {
  const id = randomUUID(),
    key = randomUUID(),
    body = { id, seller_id: sellerId, data: product };
  const first = await cmd(ownerToken, 'post', '/v1/offers', body, key),
    again = await cmd(ownerToken, 'post', '/v1/offers', body, key);
  expect(first.status, first.text).toBe(200);
  expect(again.body).toEqual(first.body);
  expect(
    (
      await cmd(
        ownerToken,
        'post',
        '/v1/offers',
        { ...body, data: { ...product, title: 'Otro título ficticio' } },
        key,
      )
    ).status,
  ).toBe(409);
  expect(
    (
      await request(app.getHttpServer())
        .get('/v1/offers/' + id)
        .set(bearer(otherToken))
    ).status,
  ).toBe(404);
  expect(
    (await cmd(ownerToken, 'patch', '/v1/offers/' + id, { expected_version: 99, data: product }))
      .status,
  ).toBe(409);
  expect(
    (
      await cmd(ownerToken, 'patch', '/v1/offers/' + id, {
        expected_version: 1,
        data: product,
        actor: reviewActor,
      })
    ).status,
  ).toBe(422);
});
it('MAR-M3-IT-BE-004-009-005-006-007 | crear, foto privada, enviar, revisar, publicar y pausar unidos', async () => {
  const draft = await create();
  const png = await sharp({ create: { width: 80, height: 60, channels: 3, background: '#145544' } })
    .png()
    .toBuffer();
  const photo = randomUUID();
  const path = `/v1/offers/${draft.id}/versions/${draft.version_id}/photos/${photo}?position=1`;
  const upload = await request(app.getHttpServer())
    .put(path)
    .set(bearer(ownerToken))
    .set('Content-Type', 'image/png')
    .send(png);
  expect(upload.status, upload.text).toBe(200);
  expect(upload.body).toEqual({ id: photo, version_id: draft.version_id, position: 1 });
  const privatePath = `/v1/offers/${draft.id}/photos/${photo}/detail`;
  expect((await request(app.getHttpServer()).get(privatePath).set(bearer(ownerToken))).status).toBe(
    200,
  );
  expect((await request(app.getHttpServer()).get(privatePath).set(bearer(otherToken))).status).toBe(
    404,
  );
  expect(
    (await request(publicApp.getHttpServer()).get('/v1/catalog/photos/' + photo + '/detail'))
      .status,
  ).toBe(404);
  const sent = await cmd(ownerToken, 'post', `/v1/offers/${draft.id}/submit`, {
    expected_version: 1,
    version_id: draft.version_id,
  });
  expect(sent.status, sent.text).toBe(200);
  expect(
    (
      await request(app.getHttpServer())
        .put(path)
        .set(bearer(ownerToken))
        .set('Content-Type', 'image/png')
        .send(png)
    ).status,
  ).toBe(409);
  expect(
    (await request(app.getHttpServer()).get('/v1/offers?scope=review').set(bearer(ownerToken)))
      .status,
  ).toBe(403);
  const queue = await request(app.getHttpServer())
    .get('/v1/offers?scope=review')
    .set(bearer(reviewToken));
  expect(queue.status, queue.text).toBe(200);
  expect(queue.body.items.some((o) => o.id === draft.id)).toBe(true);
  const decision = {
    expected_version: sent.body.revision,
    version_id: draft.version_id,
    decision: 'approved',
    reason: 'Revisión ficticia de todos los datos y fotos.',
  };
  const ownReviewer = identity.issue({ ...actor, reviewer: true, mfa: true });
  expect(
    (await cmd(ownReviewer, 'post', `/v1/offers/${draft.id}/decisions`, decision)).status,
  ).toBe(403);
  const approved = await cmd(reviewToken, 'post', `/v1/offers/${draft.id}/decisions`, decision);
  expect(approved.status, approved.text).toBe(200);
  const publicOffer = await request(publicApp.getHttpServer()).get(
    '/v1/catalog/offers/' + draft.id,
  );
  expect(publicOffer.status, publicOffer.text).toBe(200);
  expect(publicOffer.body.photos[0].id).toBe(photo);
  const detail = await request(app.getHttpServer())
    .get('/v1/offers/' + draft.id)
    .set(bearer(ownerToken));
  expect(detail.body.versions[0]).not.toHaveProperty('reviewed_by');
  expect(detail.body.versions[0].photos).toEqual([{ id: photo, position: 1 }]);
  const paused = await cmd(ownerToken, 'post', `/v1/offers/${draft.id}/pause`, {
    expected_version: approved.body.revision,
  });
  expect(paused.status, paused.text).toBe(200);
  expect(
    (await request(publicApp.getHttpServer()).get('/v1/catalog/offers/' + draft.id)).status,
  ).toBe(404);
  expect(
    (await request(publicApp.getHttpServer()).get('/v1/catalog/photos/' + photo + '/detail'))
      .status,
  ).toBe(404);
});
it('MAR-M3-IT-BE-006-ROLE | sesión revocada, rol actual y MFA insuficiente fallan cerrado', async () => {
  const token = identity.issue({ ...reviewActor, mfa: false });
  expect(
    (await request(app.getHttpServer()).get('/v1/offers?scope=review').set(bearer(token))).status,
  ).toBe(403);
  identity.sessions.get(token).mfa = true;
  expect(
    (await request(app.getHttpServer()).get('/v1/offers?scope=review').set(bearer(token))).status,
  ).toBe(200);
  identity.sessions.get(token).reviewer = false;
  expect(
    (await request(app.getHttpServer()).get('/v1/offers?scope=review').set(bearer(token))).status,
  ).toBe(403);
  identity.sessions.get(token).revoked = true;
  expect((await request(app.getHttpServer()).get('/v1/offers').set(bearer(token))).status).toBe(
    401,
  );
});
it('MAR-M3-IT-BE-004-CURSOR | límite y cursor ligados al actor y ámbito', async () => {
  const first = await request(app.getHttpServer())
    .get('/v1/offers?limit=1')
    .set(bearer(ownerToken));
  expect(first.status, first.text).toBe(200);
  expect(first.body.items).toHaveLength(1);
  expect(first.body.next_cursor).toBeTruthy();
  const next = await request(app.getHttpServer())
    .get('/v1/offers?limit=1&cursor=' + first.body.next_cursor)
    .set(bearer(ownerToken));
  expect(next.status, next.text).toBe(200);
  expect(next.body.items[0].id).not.toBe(first.body.items[0].id);
  expect(
    (
      await request(app.getHttpServer())
        .get('/v1/offers?cursor=' + first.body.next_cursor)
        .set(bearer(otherToken))
    ).status,
  ).toBe(422);
  for (const query of ['limit=0', 'limit=51', 'scope=bad', 'scope=own&scope=review', 'unknown=x'])
    expect(
      (
        await request(app.getHttpServer())
          .get('/v1/offers?' + query)
          .set(bearer(ownerToken))
      ).status,
    ).toBe(422);
});
it('MAR-M3-IT-BE-009-INPUT | límites HTTP y bytes inválidos no crean una foto', async () => {
  const draft = await create(),
    base = `/v1/offers/${draft.id}/versions/${draft.version_id}/photos/`;
  expect(
    (
      await request(app.getHttpServer())
        .put(base + randomUUID() + '?position=1')
        .set(bearer(ownerToken))
        .set('Content-Type', 'image/jpeg')
        .send(Buffer.alloc(20))
    ).status,
  ).toBe(422);
  expect(
    (
      await request(app.getHttpServer())
        .put(base + randomUUID() + '?position=1')
        .set(bearer(ownerToken))
        .set('Content-Type', 'image/png')
        .send(Buffer.alloc(5000001))
    ).status,
  ).toBe(413);
  expect(
    (
      await request(app.getHttpServer())
        .post('/v1/offers')
        .set(bearer(ownerToken))
        .set('Content-Type', 'application/json')
        .send('{bad')
    ).status,
  ).toBe(400);
});
it('MAR-M3-IT-BE-008-PRIVATE | cambio de elegibilidad oculta también gestión y lectura privada', async () => {
  const draft = await create();
  try {
    await sql.execute(
      'UPDATE m3."SellerEligibility" SET enabled=false WHERE id=$1::uuid',
      sellerId,
    );
    expect(
      (
        await request(app.getHttpServer())
          .get('/v1/offers/' + draft.id)
          .set(bearer(ownerToken))
      ).status,
    ).toBe(404);
    expect(
      (
        await cmd(ownerToken, 'post', '/v1/offers', {
          id: randomUUID(),
          seller_id: sellerId,
          data: product,
        })
      ).status,
    ).toBe(403);
  } finally {
    await sql.execute('UPDATE m3."SellerEligibility" SET enabled=true WHERE id=$1::uuid', sellerId);
  }
});
