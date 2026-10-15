import { cleanupPrivateFixtures } from '../../../fixtures/private-file-cleanup.mjs';
import { beforeAll, afterAll, it, expect } from 'vitest';
import supertest from 'supertest';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileHash } from '../../../../apps/api/dist/modules/m1/domain/file-policy.js';
import { database } from '../../../../apps/api/dist/database.js';
import { PrismaFileRepository } from '../../../../apps/api/dist/modules/m1/infrastructure/repositories/prisma-file-repository.js';
import { LocalPrivateStorage } from '../../../../apps/api/dist/modules/m1/infrastructure/adapters/local-private-storage.js';
import { ProcessFileDeletions } from '../../../../apps/api/dist/modules/m1/application/use-cases/process-file-deletions.js';
process.loadEnvFile(process.env.MARLEVA_ENV_FILE ?? new URL('../../../../.env', import.meta.url));
const require = createRequire(new URL('../../../../apps/api/package.json', import.meta.url)),
  { createClient } = require('@supabase/supabase-js');
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const db = database(),
  http = supertest('http://127.0.0.1:3000'),
  run = Date.now();
let a, b, item, second;
const keys = [];
function request(path, method = 'get', body, session = a) {
  let r = http[method](path).set('x-marleva-client', 'native');
  if (session) r = r.set('Authorization', 'Bearer ' + session.token);
  return body === undefined ? r : r.send(body);
}
async function login(suffix) {
  const address = `b09-${run}-${suffix}@example.test`,
    start = Date.now();
  const challenge = await request('/v1/auth/challenges', 'post', { correo: address }, null);
  expect(challenge.status).toBe(201);
  let code;
  for (let i = 0; i < 100; i++) {
    const list = await (await fetch(process.env.MAILPIT_URL + '/api/v1/messages')).json();
    const message = list.messages.find(
      (m) =>
        m.Subject === 'Código de acceso Marleva local' &&
        m.To.some((t) => t.Address === address) &&
        +new Date(m.Created) >= start,
    );
    if (message) {
      const body = await (
        await fetch(process.env.MAILPIT_URL + '/api/v1/message/' + message.ID)
      ).json();
      code = (body.Text + ' ' + body.HTML).match(/\b\d{6}\b/)?.[0];
      if (code) break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  expect(code).toBeDefined();
  const verify = await request(
    '/v1/auth/verifications',
    'post',
    { challenge_id: challenge.body.challenge_id, codigo: code },
    null,
  );
  expect(verify.status).toBe(201);
  return { token: verify.body.session_token, id: verify.body.cuenta.id };
}
async function fixture(owner = a, data = Buffer.from('archivo ficticio B09')) {
  const id = randomUUID(),
    key = `b09-${run}/${id}.txt`;
  keys.push(key);
  const upload = await admin.storage
    .from('m1-private')
    .upload(key, data, { contentType: 'text/plain' });
  expect(upload.error).toBeNull();
  return db.privateFixture.create({
    data: { id, accountId: owner.id, objectKey: key, sha256: fileHash(data), bytes: data.length },
  });
}
const path = (id) => '/v1/local/file-fixtures/' + id;
async function access(id = item.id, session = a) {
  return request(path(id) + '/access', 'post', undefined, session);
}
beforeAll(async () => {
  if (
    process.env.APP_MODE !== 'local' ||
    new URL(process.env.SUPABASE_URL).hostname !== '127.0.0.1'
  )
    throw new Error('Solo fixtures locales');
  a = await login('a');
  b = await login('b');
  item = await fixture();
  second = await fixture();
}, 30000);
afterAll(async () => {
  await cleanupPrivateFixtures(db, admin, new LocalPrivateStorage(), keys);
  await db.$disconnect();
});
it('MAR-M1-IT-BE-111-A | SEQ011:S030/S080/S085 | Storage real privado y permiso ligado al titular/objeto', async () => {
  const permission = await access();
  expect(permission.status).toBe(201);
  expect(permission.headers['cache-control']).toBe('no-store');
  const content = await request(path(item.id) + '/content').set(
    'x-fixture-capability',
    permission.body.capability,
  );
  expect(content.status, content.text).toBe(200);
  expect(content.text).toBe('archivo ficticio B09');
  expect(content.headers['x-content-type-options']).toBe('nosniff');
  expect((await access(item.id, b)).status).toBe(404);
  expect(
    (
      await request(path(item.id) + '/content', 'get', undefined, b).set(
        'x-fixture-capability',
        permission.body.capability,
      )
    ).status,
  ).toBe(404);
  expect((await request(path(item.id) + '/content', 'get', undefined, null)).status).toBe(401);
  expect(
    (
      await request(path(second.id) + '/content').set(
        'x-fixture-capability',
        permission.body.capability,
      )
    ).status,
  ).toBe(403);
  const original = await db.session.findFirst({ where: { accountId: a.id, revokedAt: null } });
  const alternateToken = randomUUID() + randomUUID();
  const alternate = await db.session.create({
    data: {
      accountId: a.id,
      tokenHash: fileHash(alternateToken),
      csrfHash: original.csrfHash,
      providerTokens: original.providerTokens,
    },
  });
  expect(
    (
      await request(path(item.id) + '/content', 'get', undefined, {
        id: a.id,
        token: alternateToken,
      }).set('x-fixture-capability', permission.body.capability)
    ).status,
  ).toBe(403);
  await db.session.update({ where: { id: alternate.id }, data: { revokedAt: new Date() } });
  const publicResponse = await fetch(
    process.env.SUPABASE_URL + '/storage/v1/object/public/m1-private/' + item.objectKey,
  );
  expect(publicResponse.ok).toBe(false);
  await publicResponse.body?.cancel();
  const replacement = await access();
  expect(replacement.status).toBe(201);
  expect(
    (
      await request(path(item.id) + '/content').set(
        'x-fixture-capability',
        permission.body.capability,
      )
    ).status,
  ).toBe(403);
  await db.fixtureAccess.updateMany({
    where: { tokenHash: fileHash(replacement.body.capability) },
    data: { expiresAt: new Date(Date.now() - 1), createdAt: new Date(Date.now() - 1000) },
  });
  expect(
    (
      await request(path(item.id) + '/content').set(
        'x-fixture-capability',
        replacement.body.capability,
      )
    ).status,
  ).toBe(403);
}, 20000);
it('MAR-M1-IT-BE-111-B | SEQ011:S030/S080 | cuota durable, espera real y hash inválido sin bytes', async () => {
  const bad = await fixture();
  await db.privateFixture.update({ where: { id: bad.id }, data: { sha256: '0'.repeat(64) } });
  const permission = await access(bad.id);
  expect(permission.status).toBe(201);
  const content = await request(path(bad.id) + '/content').set(
    'x-fixture-capability',
    permission.body.capability,
  );
  expect(content.status).toBe(503);
  expect(content.text).not.toContain('archivo ficticio');
  for (let i = 0; i < 7; i++) expect((await access()).status).toBe(201);
  const limit = await access();
  expect(limit.status).toBe(429);
  expect(Number(limit.headers['retry-after'])).toBeGreaterThan(0);
  expect(Number(limit.headers['retry-after'])).toBeLessThanOrEqual(60);
  expect(
    (
      await request(path(item.id), 'delete', { expected_version: 1, accountId: b.id }).set(
        'Idempotency-Key',
        'b09-invalid-body-key',
      )
    ).status,
  ).toBe(422);
}, 20000);
it('MAR-M1-IT-BE-111-C | SEQ011:S100/S120/S140 | DELETE durable, concurrencia e idempotencia', async () => {
  const target = await fixture(b),
    key = 'b09-delete-key-' + run;
  const responses = await Promise.all([
    request(path(target.id), 'delete', { expected_version: 1 }, b).set('Idempotency-Key', key),
    request(path(target.id), 'delete', { expected_version: 1 }, b).set('Idempotency-Key', key),
  ]);
  expect(responses.every((r) => r.status === 202 || r.status === 200)).toBe(true);
  expect(responses[0].body.task_id).toBe(responses[1].body.task_id);
  expect((await access(target.id, b)).status).toBe(404);
  expect(
    (
      await request(path(target.id), 'delete', { expected_version: 2 }, b).set(
        'Idempotency-Key',
        key,
      )
    ).status,
  ).toBe(409);
  await new ProcessFileDeletions(new PrismaFileRepository(db), new LocalPrivateStorage()).execute();
  const replay = await request(path(target.id), 'delete', { expected_version: 1 }, b).set(
    'Idempotency-Key',
    key,
  );
  expect(replay.status, replay.text).toBe(200);
  expect(replay.body.estado).toBe('deleted');
  expect(await new LocalPrivateStorage().absent(target.objectKey)).toBe(true);
}, 20000);
it('MAR-M1-IT-BE-111-E | SEQ011:S100/S120 | caída Storage conserva intención y reintento confirma borrado', async () => {
  const target = await fixture(b),
    key = 'b09-down-key-' + run;
  const tool = new URL('../../../../scripts/tool', import.meta.url).pathname;
  const docker = (args) => {
    const result = spawnSync(tool, ['docker', ...args], { encoding: 'utf8', timeout: 30000 });
    if (result.status !== 0) throw new Error('Servicio local no disponible');
  };
  let stopped = false;
  try {
    docker([
      'stop',
      process.env.MARLEVA_CI_STACK === '1'
        ? 'supabase_storage_marleva-ci'
        : 'supabase_storage_marleva-m1',
    ]);
    stopped = true;
    const permission = await access(target.id, b);
    expect(permission.status).toBe(201);
    expect(
      (
        await request(path(target.id) + '/content', 'get', undefined, b).set(
          'x-fixture-capability',
          permission.body.capability,
        )
      ).status,
    ).toBe(503);
    const result = await request(path(target.id), 'delete', { expected_version: 1 }, b).set(
      'Idempotency-Key',
      key,
    );
    expect(result.status).toBe(202);
    expect((await access(target.id, b)).status).toBe(404);
    await new ProcessFileDeletions(
      new PrismaFileRepository(db),
      new LocalPrivateStorage(),
    ).execute();
    expect((await db.privateFixture.findUnique({ where: { id: target.id } })).state).toBe(
      'delete_pending',
    );
  } finally {
    if (stopped)
      docker([
        'start',
        process.env.MARLEVA_CI_STACK === '1'
          ? 'supabase_storage_marleva-ci'
          : 'supabase_storage_marleva-m1',
      ]);
  }
  for (let i = 0; i < 50; i++) {
    const result = await admin.storage.getBucket('m1-private');
    if (!result.error) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  // Accelerate only this fixture's retry schedule; real Storage stop/start is preserved.
  await db.fixtureDeletion.updateMany({
    where: { fixtureId: target.id, state: 'pending' },
    data: { dueAt: new Date() },
  });
  await new ProcessFileDeletions(new PrismaFileRepository(db), new LocalPrivateStorage()).execute();
  const result = await request(path(target.id), 'delete', { expected_version: 1 }, b).set(
    'Idempotency-Key',
    key,
  );
  expect(result.status, result.text).toBe(200);
  expect(result.body.estado).toBe('deleted');
}, 60000);
it('MAR-M1-IT-BE-111-F | SEQ011:S120/S140 | lease cercada impide confirmar desde trabajador antiguo', async () => {
  const target = await fixture(b),
    now = new Date(Date.now() + 60000);
  await db.privateFixture.update({
    where: { id: target.id },
    data: { state: 'delete_pending', deleteRequestedAt: new Date(), version: 2 },
  });
  const task = await db.fixtureDeletion.create({
    data: {
      fixtureId: target.id,
      accountId: b.id,
      idempotencyKey: 'b09-lease-' + run,
      requestHash: '1'.repeat(64),
      expectedVersion: 1,
      dueAt: now,
    },
  });
  const repository = new PrismaFileRepository(db),
    job = { id: task.id, fixtureId: target.id, objectKey: target.objectKey, attempts: 0 },
    lease = new Date(+now + 15000);
  const results = await Promise.all([
    repository.claim(job, now, lease),
    repository.claim(job, now, lease),
  ]);
  expect(results.sort()).toEqual([false, true]);
  const later = new Date(+lease + 1),
    nextLease = new Date(+later + 15000);
  expect(await repository.claim({ ...job, attempts: 1 }, later, nextLease)).toBe(true);
  await repository.complete(job, lease, later);
  await repository.retry(job.id, lease, later);
  expect((await db.fixtureDeletion.findUnique({ where: { id: task.id } })).state).toBe(
    'processing',
  );
  const storage = new LocalPrivateStorage();
  await storage.remove(target.objectKey);
  expect(await storage.absent(target.objectKey)).toBe(true);
  await repository.complete(job, nextLease, later);
  expect((await db.privateFixture.findUnique({ where: { id: target.id } })).state).toBe('deleted');
}, 20000);
it('MAR-M1-IT-BE-111-D | SEQ011:S085 | logout invalida acceso aunque proveedor siga vivo', async () => {
  const target = await fixture(b),
    valid = await access(target.id, b);
  expect(valid.status).toBe(201);
  expect((await request('/v1/auth/sessions/current', 'delete', undefined, b)).status).toBe(200);
  expect(
    (
      await request(path(target.id) + '/content', 'get', undefined, b).set(
        'x-fixture-capability',
        valid.body.capability,
      )
    ).status,
  ).toBe(401);
}, 20000);
