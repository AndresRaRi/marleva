import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { recoveryContext } from './recovery-context.mjs';
const context = recoveryContext();
assert.ok(context.isolated);
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const copy = read(context.report('copy'));
assert.equal(copy.names.prefix, context.names.prefix);
const provider = read(context.report('provider'));
assert.equal(provider.copyPrefix, context.names.prefix);
for (const key of [
  'postCopyDeletionReapplied',
  'providerOldAccessAndRefreshRejected',
  'oldMarlevaSessionsRejected',
  'storageDownKeepsIntentAndBlocksRead',
])
  assert.equal(provider.cases[key], true);
const stack = read(context.folder + '/provider/stack.private.json');
assert.equal(stack.copyPrefix, context.names.prefix);
const dbUrl = new URL(stack.environment.DATABASE_URL);
assert.equal(dbUrl.protocol, 'postgresql:');
assert.equal(dbUrl.hostname, '127.0.0.1');
assert.equal(dbUrl.port, '54422');
assert.equal(decodeURIComponent(dbUrl.username), 'marleva_api');
assert.equal(dbUrl.pathname, '/postgres');
assert.equal(dbUrl.hash, '');
assert.ok(dbUrl.search === '' || dbUrl.search === '?schema=marleva');
assert.equal(stack.environment.SUPABASE_URL, 'http://127.0.0.1:54421');
assert.equal(stack.environment.APP_MODE, 'local');
const [container] = JSON.parse(
  execFileSync('docker', ['inspect', context.names.prefix + '-db-provider'], {
    encoding: 'utf8',
    timeout: 10000,
  }),
);
assert.equal(container.State.Running, true);
assert.equal(container.Config.Labels['marleva.b12.run'], context.run);
assert.equal(
  container.Image,
  copy.sourceImages.find((item) => item.name.includes('supabase_db_')).image,
);
assert.ok(
  container.Mounts.some(
    (mount) =>
      mount.Type === 'volume' &&
      mount.Name === context.names.pgTarget &&
      mount.Destination === '/var/lib/postgresql/data',
  ),
);
Object.assign(process.env, stack.environment, {
  APP_ORIGIN: 'https://localhost:8445',
  MARLEVA_TEST: '1',
});
const { makeApp } = await import('../../apps/api/dist/main.js');
const { AccountService } = await import('../../apps/api/dist/account.service.js');
const app = await makeApp();
await app.listen(3001, '127.0.0.1');
const db = app.get(AccountService).db;
let active = false;
let timer;
if (process.env.MARLEVA_RECOVERY_OPERATOR_UI === '1') {
  const fixture = read(context.fixture);
  const owner = fixture.operators.find((item) => item.name === 'owner');
  assert.equal(
    await db.mfaRecovery.count({ where: { accountId: { not: owner.accountId } } }),
    0,
    'No actuar sobre recuperaciones ajenas',
  );
  const { ProcessMfaRecoveries } =
    await import('../../apps/api/dist/modules/m1/application/use-cases/process-mfa-recoveries.js');
  const worker = app.get(ProcessMfaRecoveries);
  timer = setInterval(
    () =>
      void (async () => {
        if (active) return;
        active = true;
        try {
          const rows = await db.mfaRecovery.findMany({
            where: { state: { in: ['approved', 'executing', 'provider_pending'] } },
          });
          for (const row of rows) {
            assert.equal(row.accountId, owner.accountId);
            assert.deepEqual(
              row.providerState.factorIds,
              [owner.factorId],
              'Retirar solo factor ficticio autorizado',
            );
          }
          await worker.execute();
        } finally {
          active = false;
        }
      })(),
    1000,
  );
}
process.once(
  'SIGTERM',
  () =>
    void (async () => {
      clearInterval(timer);
      while (active) await new Promise((resolve) => setTimeout(resolve, 50));
      await app.close();
      await db.$disconnect();
    })(),
);
console.log('API B12 destino verificado lista');
