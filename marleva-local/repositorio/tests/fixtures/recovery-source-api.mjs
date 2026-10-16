import assert from 'node:assert/strict';
import { recoveryContext } from './recovery-context.mjs';
const context = recoveryContext();
assert.ok(context.isolated);
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
process.loadEnvFile(context.envFile);
process.env.MARLEVA_TEST = '1';
assert.equal(new URL(process.env.DATABASE_URL).port, '54722');
assert.equal(new URL(process.env.SUPABASE_URL).port, '54721');
const { makeApp } = await import('../../apps/api/dist/main.js');
const { AccountService } = await import('../../apps/api/dist/account.service.js');
const { ProcessFileDeletions } =
  await import('../../apps/api/dist/modules/m1/application/use-cases/process-file-deletions.js');
const { PrismaFileRepository } =
  await import('../../apps/api/dist/modules/m1/infrastructure/repositories/prisma-file-repository.js');
const { LocalPrivateStorage } =
  await import('../../apps/api/dist/modules/m1/infrastructure/adapters/local-private-storage.js');
const app = await makeApp();
const db = app.get(AccountService).db;
await app.listen(3106, '127.0.0.1');
const processor = new ProcessFileDeletions(new PrismaFileRepository(db), new LocalPrivateStorage());
let active = false;
const timer = setInterval(async () => {
  if (active) return;
  active = true;
  try {
    await processor.execute();
  } finally {
    active = false;
  }
}, 1000);
async function stop() {
  clearInterval(timer);
  while (active) await new Promise((resolve) => setTimeout(resolve, 50));
  await app.close();
  await db.$disconnect();
}
process.once('SIGTERM', () => void stop());
console.log('API del origen B12 aislado lista; entrega de correo permanece detenida');
