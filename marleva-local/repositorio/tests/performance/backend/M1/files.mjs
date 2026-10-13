import { cleanupPrivateFixtures } from '../../../fixtures/private-file-cleanup.mjs';
import { writeFile } from 'node:fs/promises';
import { randomUUID, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { database } from '../../../../apps/api/dist/database.js';
import { PrismaFileRepository } from '../../../../apps/api/dist/modules/m1/infrastructure/repositories/prisma-file-repository.js';
import { LocalPrivateStorage } from '../../../../apps/api/dist/modules/m1/infrastructure/adapters/local-private-storage.js';
import { ReadPrivateFile } from '../../../../apps/api/dist/modules/m1/application/use-cases/read-private-file.js';
import { fileHash } from '../../../../apps/api/dist/modules/m1/domain/file-policy.js';
process.loadEnvFile(new URL('../../../../.env', import.meta.url));
const require = createRequire(new URL('../../../../apps/api/package.json', import.meta.url)),
  { createClient } = require('@supabase/supabase-js');
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const db = database(),
  repository = new PrismaFileRepository(db),
  storage = new LocalPrivateStorage(),
  reader = new ReadPrivateFile(repository, storage),
  keys = [],
  results = [];
try {
  if (
    process.env.APP_MODE !== 'local' ||
    new URL(process.env.SUPABASE_URL).hostname !== '127.0.0.1'
  )
    throw new Error('Solo local');
  const session = await db.session.findFirst({
    where: { revokedAt: null, account: { email: { startsWith: 'b09-' } } },
    orderBy: { createdAt: 'desc' },
  });
  if (!session) throw new Error('Falta sesión ficticia B09');
  const actor = { accountId: session.accountId, sessionId: session.id };
  for (const bytes of [1024, 1048576]) {
    const data = Buffer.alloc(bytes, 65),
      id = randomUUID(),
      key = 'b09-performance/' + id + '.txt';
    // Use exactly the documented 32-byte base64url format.
    const token = randomBytes(32).toString('base64url');
    keys.push(key);
    const upload = await admin.storage
      .from('m1-private')
      .upload(key, data, { contentType: 'text/plain' });
    if (upload.error) throw new Error('Fixture Storage no disponible');
    await db.privateFixture.create({
      data: { id, accountId: actor.accountId, objectKey: key, sha256: fileHash(data), bytes },
    });
    try {
      await repository.issue(actor, id, fileHash(token), new Date());
    } catch (error) {
      if (error.kind !== 'limit' || !error.retryAfter) throw error;
      await new Promise((resolve) => setTimeout(resolve, error.retryAfter * 1000 + 100));
      await repository.issue(actor, id, fileHash(token), new Date());
    }

    for (const concurrency of [1, 5, 10]) {
      let samples = [],
        errors = 0,
        totalBytes = 0,
        peakRss = process.memoryUsage().rss;
      async function phase(duration, record) {
        const end = performance.now() + duration;
        await Promise.all(
          Array.from({ length: concurrency }, async () => {
            while (performance.now() < end) {
              const start = performance.now();
              try {
                const result = await reader.execute(actor, id, token);
                if (result.length !== bytes || fileHash(result) !== fileHash(data))
                  throw new Error('Contenido incorrecto');
                if (record) {
                  samples.push(performance.now() - start);
                  totalBytes += result.length;
                }
              } catch {
                if (record) errors++;
              }
              peakRss = Math.max(peakRss, process.memoryUsage().rss);
            }
          }),
        );
      }
      await phase(1000, false);
      const start = performance.now();
      await phase(5000, true);
      const elapsed = performance.now() - start;
      samples.sort((a, b) => a - b);
      const q = (p) =>
        samples[Math.min(samples.length - 1, Math.floor(samples.length * p))] ?? null;
      results.push({
        bytes,
        concurrency,
        warmup_ms: 1000,
        measurement_ms: elapsed,
        successful: samples.length,
        errors,
        totalBytes,
        p50_ms: q(0.5),
        p95_ms: q(0.95),
        p99_ms: q(0.99),
        requests_per_second: samples.length / (elapsed / 1000),
        peak_client_rss_bytes: peakRss,
      });
    }
  }
  await writeFile(
    'tests/results/files-performance.json',
    JSON.stringify(
      {
        case: 'MAR-M1-PF-BE-111-A',
        date: new Date().toISOString(),
        node: process.version,
        scope:
          'ReadPrivateFile + PG17 + Storage local; sin HTTP/Auth frontend; humo proporcional, no capacidad productiva',
        results,
      },
      null,
      2,
    ) + '\n',
  );
  if (results.some((r) => r.errors || !r.successful)) throw new Error('Lectura medida falló');
  console.log('B09: seis combinaciones medidas, sin contenido incorrecto ni errores');
} finally {
  await cleanupPrivateFixtures(db, admin, new LocalPrivateStorage(), keys);
  await db.$disconnect();
}
