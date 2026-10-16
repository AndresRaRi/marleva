import { beforeAll, afterAll, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { writeFile, readFile, symlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import request from 'supertest';
import { connectM3 } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/prisma-sql.js';
import { createM3 } from '../../../../apps/api/dist-m3/m3-main.js';
import { AttachPhoto } from '../../../../apps/api/src/modules/m3/application/use-cases/attach-photo.ts';
import { PrismaPhotoRepository } from '../../../../apps/api/src/modules/m3/infrastructure/repositories/prisma-photo-repository.ts';
import { LocalPhotoStore } from '../../../../apps/api/src/modules/m3/infrastructure/adapters/local-photo-store.ts';
import { SharpPhotoProcessor } from '../../../../apps/api/dist-m3/modules/m3/infrastructure/adapters/sharp-photo-processor.js';
import { ChangeOffer } from '../../../../apps/api/src/modules/m3/application/use-cases/change-offer.ts';
import { PrismaOfferRepository } from '../../../../apps/api/src/modules/m3/infrastructure/repositories/prisma-offer-repository.ts';
import {
  seed,
  actor,
  reviewActor,
  product,
  sellerId,
  command,
} from '../../../fixtures/m3-fixtures.mjs';
function withGps(jpeg) {
  const tiff = Buffer.alloc(140);
  tiff.write('II');
  tiff.writeUInt16LE(42, 2);
  tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(2, 8);
  const entry = (at, tag, type, count, value) => {
    tiff.writeUInt16LE(tag, at);
    tiff.writeUInt16LE(type, at + 2);
    tiff.writeUInt32LE(count, at + 4);
    tiff.writeUInt32LE(value, at + 8);
  };
  entry(10, 0x0112, 3, 1, 6);
  entry(22, 0x8825, 4, 1, 38);
  tiff.writeUInt16LE(4, 38);
  entry(40, 1, 2, 2, 78);
  entry(52, 2, 5, 3, 92);
  entry(64, 3, 2, 2, 87);
  entry(76, 4, 5, 3, 116);
  for (const [offset, values] of [
    [92, [20, 58, 0]],
    [116, [89, 36, 0]],
  ])
    values.forEach((value, index) => {
      tiff.writeUInt32LE(value, offset + index * 8);
      tiff.writeUInt32LE(1, offset + index * 8 + 4);
    });
  const payload = Buffer.concat([Buffer.from('Exif\0\0'), tiff]);
  const marker = Buffer.alloc(4);
  marker[0] = 255;
  marker[1] = 225;
  marker.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([jpeg.subarray(0, 2), marker, payload, jpeg.subarray(2)]);
}
let db, api, app, change, attach, processor, store, repository, png, published;
const photo = (version, bytes = png, extra = {}) => ({
  id: randomUUID(),
  version_id: version,
  position: 1,
  mime: 'image/png',
  bytes,
  ...extra,
});
async function draft() {
  const cmd = command('create', { data: product });
  const result = await change.execute(cmd, actor);
  return { cmd, ...result };
}
async function publish(d) {
  await change.execute(
    {
      ...d.cmd,
      operation: 'submit',
      key: randomUUID(),
      expected_revision: 1,
      version_id: d.version_id,
    },
    actor,
  );
  await change.execute(
    {
      ...d.cmd,
      operation: 'decide',
      key: randomUUID(),
      expected_revision: 2,
      version_id: d.version_id,
      decision: 'approved',
      reason: 'Foto ficticia verificada en ensayo',
    },
    reviewActor,
  );
}
beforeAll(async () => {
  if (process.env.MARLEVA_M3_CHECK !== '1') throw Error('Solo base M3 propia.');
  db = connectM3(true);
  api = connectM3();
  await seed(db.sql, 0);
  change = new ChangeOffer(new PrismaOfferRepository(db.sql));
  repository = new PrismaPhotoRepository(db.sql);
  store = new LocalPhotoStore();
  processor = new SharpPhotoProcessor();
  attach = new AttachPhoto(repository, store, processor);
  png = await sharp({ create: { width: 1600, height: 1200, channels: 3, background: '#145544' } })
    .png()
    .toBuffer();
  app = await createM3(api.sql);
  await app.listen(0, '127.0.0.1');
}, 60000);
afterAll(async () => {
  await app?.close();
  await api?.client.$disconnect();
  await db?.client.$disconnect();
});
it('MAR-M3-IT-BE-009-P | EXIF/orientación, PNG, dos derivados y HTTP público íntegro', async () => {
  const raw = await sharp({ create: { width: 40, height: 80, channels: 3, background: '#C65438' } })
    .withIccProfile('srgb')
    .jpeg()
    .toBuffer();
  const jpeg = withGps(raw);
  const originalInfo = await sharp(jpeg).metadata();
  expect(originalInfo.orientation).toBe(6);
  expect(originalInfo.exif).toBeDefined();
  expect(originalInfo.icc).toBeDefined();
  expect(originalInfo.exif.readUInt16LE(28)).toBe(0x8825);
  const d = await draft();
  const input = photo(d.version_id, jpeg, { mime: 'image/jpeg' });
  const first = await attach.execute(input, actor);
  expect(first.derivatives.detail).toMatchObject({ width: 80, height: 40 });
  const second = await attach.execute(photo(d.version_id, png, { position: 2 }), actor);
  expect(second.derivatives.card.width).toBe(480);
  expect(second.derivatives.detail.width).toBe(1600);
  await request(app.getHttpServer()).get(`/v1/catalog/photos/${first.id}/detail`).expect(404);
  await publish(d);
  published = { draft: d, first, second };
  const response = await request(app.getHttpServer())
    .get(`/v1/catalog/photos/${first.id}/detail`)
    .expect(200);
  expect(response.headers['content-type']).toContain('image/jpeg');
  expect(response.headers['cache-control']).toBe('no-store');
  expect(response.headers['x-content-type-options']).toBe('nosniff');
  expect(response.headers['content-length']).toBe(String(response.body.length));
  const info = await sharp(response.body).metadata();
  for (const field of ['exif', 'icc', 'iptc', 'xmp']) expect(info[field]).toBeUndefined();
  expect(info.orientation).toBeUndefined();
  const detail = await request(app.getHttpServer())
    .get('/v1/catalog/offers/' + d.id)
    .expect(200);
  expect(detail.body.photos.map((p) => p.id)).toEqual([first.id, second.id]);
  await request(app.getHttpServer()).get(`/v1/catalog/photos/${first.id}/original`).expect(422);
  await request(app.getHttpServer()).get(`/v1/catalog/photos/${first.id}/card`).expect(200);
  await request(app.getHttpServer())
    .post('/v1/catalog/photos')
    .set('x-actor-id', actor.id)
    .send({})
    .expect(404);
  await writeFile(
    'tests/results/m3-photo-example.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        offer_id: d.id,
        photo_id: first.id,
        url: `http://127.0.0.1:3103/v1/catalog/photos/${first.id}/detail`,
        png_photo_id: second.id,
      },
      null,
      2,
    ) + '\n',
  );
}, 30000);
it('MAR-M3-IT-BE-009-A | dueño, estado, repetición y clave con cuerpo distinto', async () => {
  const d = await draft();
  const input = photo(d.version_id);
  await expect(attach.execute(input, reviewActor)).rejects.toMatchObject({ status: 404 });
  const first = await attach.execute(input, actor);
  expect(await attach.execute(input, actor)).toEqual(first);
  await expect(attach.execute({ ...input, position: 2 }, actor)).rejects.toMatchObject({
    status: 409,
  });
  await expect(attach.execute(photo(d.version_id), actor)).rejects.toMatchObject({ status: 409 });
  await change.execute(
    {
      ...d.cmd,
      operation: 'submit',
      key: randomUUID(),
      expected_revision: 1,
      version_id: d.version_id,
    },
    actor,
  );
  await expect(
    attach.execute(photo(d.version_id, png, { position: 2 }), actor),
  ).rejects.toMatchObject({ status: 409 });
});
it('MAR-M3-IT-BE-009-N | truncada, formato falso y píxeles excesivos nunca se publican', async () => {
  const d = await draft();
  for (const bytes of [Buffer.from('<svg onload="alert(1)"/>'), png.subarray(0, 60)])
    await expect(attach.execute(photo(d.version_id, bytes), actor)).rejects.toMatchObject({
      status: 422,
    });
  const bomb = await sharp({
    create: { width: 5000, height: 4000, channels: 3, background: 'white' },
  })
    .png()
    .toBuffer();
  await expect(attach.execute(photo(d.version_id, bomb), actor)).rejects.toMatchObject({
    status: 422,
  });
  const rows = await db.sql.query(
    'SELECT id FROM m3."Photo" WHERE version_id=$1::uuid',
    d.version_id,
  );
  expect(rows).toEqual([]);
  await expect(store.read('../x', 'card')).rejects.toThrow();
  await expect(store.read(randomUUID(), '../../original')).rejects.toThrow();
}, 30000);
it('MAR-M3-IT-BE-009-C | seis posiciones y dos cargas compitiendo por la última', async () => {
  const d = await draft();
  for (let position = 1; position < 6; position++)
    await attach.execute(photo(d.version_id, png, { position }), actor);
  const another = new AttachPhoto(repository, store, new SharpPhotoProcessor());
  const outcomes = await Promise.allSettled([
    attach.execute(photo(d.version_id, png, { position: 6 }), actor),
    another.execute(photo(d.version_id, png, { position: 6 }), actor),
  ]);
  expect(outcomes.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
  expect(outcomes.find((x) => x.status === 'rejected').reason.status).toBe(409);
  await expect(
    attach.execute(photo(d.version_id, png, { position: 7 }), actor),
  ).rejects.toMatchObject({ status: 422 });
  const count = await db.sql.query(
    'SELECT count(*)::int AS n FROM m3."Photo" WHERE version_id=$1::uuid',
    d.version_id,
  );
  expect(count[0].n).toBe(6);
}, 30000);
it('MAR-M3-IT-BE-009-RECHECK | revocación durante decodificación bloquea inserción final', async () => {
  const d = await draft();
  const input = photo(d.version_id);
  const revoke = {
    process: async (path) => {
      const result = await processor.process(path);
      await db.sql.execute(
        'UPDATE m3."SellerEligibility" SET enabled=false WHERE id=$1::uuid',
        sellerId,
      );
      return result;
    },
  };
  try {
    await expect(
      new AttachPhoto(repository, store, revoke).execute(input, actor),
    ).rejects.toMatchObject({ status: 403 });
    expect(await db.sql.query('SELECT id FROM m3."Photo" WHERE id=$1::uuid', input.id)).toEqual([]);
  } finally {
    await db.sql.execute(
      'UPDATE m3."SellerEligibility" SET enabled=true WHERE id=$1::uuid',
      sellerId,
    );
  }
  await request(app.getHttpServer()).get(`/v1/catalog/photos/${input.id}/card`).expect(404);
});
it('MAR-M3-IT-BE-009-READ | integridad corrupta, recuperación y ocultación vigente', async () => {
  const id = published.first.id;
  const path = resolve('artifacts/m3/photos', id, 'card.jpg');
  const bytes = await readFile(path);
  try {
    await writeFile(path, Buffer.from('corrupt'));
    await request(app.getHttpServer()).get(`/v1/catalog/photos/${id}/card`).expect(503);
  } finally {
    await writeFile(path, bytes);
  }
  await request(app.getHttpServer()).get(`/v1/catalog/photos/${id}/card`).expect(200);
  await db.sql.execute(
    'UPDATE m3."SellerEligibility" SET enabled=false WHERE id=$1::uuid',
    sellerId,
  );
  try {
    const hidden = await request(app.getHttpServer())
      .get(`/v1/catalog/photos/${id}/card`)
      .expect(404);
    const missing = await request(app.getHttpServer())
      .get(`/v1/catalog/photos/${randomUUID()}/card`)
      .expect(404);
    expect(hidden.body.codigo).toBe(missing.body.codigo);
    expect(hidden.body.mensaje).toBe(missing.body.mensaje);
  } finally {
    await db.sql.execute(
      'UPDATE m3."SellerEligibility" SET enabled=true WHERE id=$1::uuid',
      sellerId,
    );
  }
  await expect(api.sql.query('SELECT source_sha256 FROM m3."Photo"')).rejects.toThrow();
  await expect(api.sql.execute('UPDATE m3."Photo" SET metadata_removed=false')).rejects.toThrow();
  await expect(
    db.sql.execute('UPDATE m3."Photo" SET derivatives=$2::jsonb WHERE id=$1::uuid', id, '{}'),
  ).rejects.toThrow();
});
it('MAR-M3-IT-BE-009-BUSY | un proceso a la vez y recuperación después de fallo', async () => {
  const id = randomUUID(),
    path = await store.quarantine(id, png),
    worker = new SharpPhotoProcessor();
  const pending = worker.process(path);
  await expect(worker.process(path)).rejects.toMatchObject({ status: 503 });
  await pending;
  const bad = await store.quarantine(randomUUID(), png.subarray(0, 60));
  await expect(worker.process(bad)).rejects.toMatchObject({ status: 422 });
  expect((await worker.process(path)).detail.bytes).toBeGreaterThan(0);
});

it('MAR-M3-IT-BE-009-TIMEOUT | plazo real mata al hijo y permite otro ensayo', async () => {
  const path = await store.quarantine(randomUUID(), png);
  await expect(new SharpPhotoProcessor(1).process(path)).rejects.toMatchObject({ status: 503 });
  await expect(new SharpPhotoProcessor().process(path + '-missing')).rejects.toMatchObject({
    status: 503,
  });
  expect((await new SharpPhotoProcessor().process(path)).card.width).toBe(480);
});

it('MAR-M3-IT-BE-009-ALPHA | transparencia a blanco y PNG animado rechazado', async () => {
  const d = await draft();
  const transparent = await sharp({
    create: { width: 16, height: 16, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
  const input = photo(d.version_id, transparent);
  const item = await attach.execute(input, actor);
  const pixel = await sharp(await store.read(item.id, 'detail'))
    .raw()
    .toBuffer();
  expect([...pixel.subarray(0, 3)]).toEqual([255, 255, 255]);
  const animation = Buffer.alloc(20);
  animation.writeUInt32BE(8, 0);
  animation.write('acTL', 4);
  animation.writeUInt32BE(2, 8);
  const fakeAnimation = Buffer.concat([png.subarray(0, 33), animation, png.subarray(33)]);
  await expect(
    attach.execute(photo(d.version_id, fakeAnimation, { position: 2 }), actor),
  ).rejects.toMatchObject({ status: 422 });
  await expect(store.quarantine(item.id, Buffer.from('different'))).rejects.toMatchObject({
    status: 409,
  });
});

it('MAR-M3-IT-BE-009-PIPE | hijo consume bytes, ignora rutas CLI y padre rechaza symlink', async () => {
  const path = await store.quarantine(randomUUID(), png);
  const link = path + '-link';
  await symlink(path, link);
  await expect(new SharpPhotoProcessor().process(link)).rejects.toMatchObject({ status: 503 });
  const child = spawnSync(
    process.execPath,
    [
      resolve('apps/api/dist-m3/modules/m3/infrastructure/adapters/sharp-photo-worker.js'),
      '/ruta-ajena-no-autorizada',
    ],
    { input: png, encoding: 'utf8', timeout: 5000, maxBuffer: 8000000 },
  );
  expect(child.status).toBe(0);
  expect(JSON.parse(child.stdout).card.width).toBe(480);
});
