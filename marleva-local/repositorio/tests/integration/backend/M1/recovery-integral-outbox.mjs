import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { recoveryContext } from '../../../fixtures/recovery-context.mjs';
const context = recoveryContext();
assert.ok(context.isolated);
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
process.loadEnvFile(context.envFile);
const fixture = JSON.parse(readFileSync(context.fixture));
const stack = JSON.parse(readFileSync(context.folder + '/provider/stack.private.json'));
assert.equal(stack.copyPrefix, context.names.prefix);
Object.assign(process.env, stack.environment);
const docker = (args) =>
  execFileSync('docker', args, { encoding: 'utf8', timeout: 30000, stdio: 'pipe' });
for (const name of [stack.names.db, stack.names.inbucket]) {
  const resource = JSON.parse(docker(['inspect', name]))[0];
  assert.equal(resource.Config.Labels['marleva.b12.run'], context.run);
}
const { database } = await import('../../../../apps/api/dist/database.js');
let db = database(),
  stopped = false;
const report = {
  date: new Date().toISOString(),
  copyPrefix: stack.copyPrefix,
  fixturePrefix: fixture.prefix,
  cases: {},
  limits: [
    'Reloj explícito para backoff, sin RPO/RTO productivo',
    'SMTP puede repetir una entrega aceptada antes del ACK; no exactly-once',
  ],
};
const started = Date.now();
const business = () =>
  db.$queryRawUnsafe(
    'SELECT row_to_json(a)::text AS value FROM marleva."Account" a UNION ALL SELECT row_to_json(e)::text FROM marleva."EmailChange" e UNION ALL SELECT row_to_json(n)::text FROM marleva."Notice" n ORDER BY value',
  );
const messages = async (url) =>
  (await (await fetch(url + '/api/v1/messages')).json()).messages.filter((mail) =>
    mail.Subject.startsWith(fixture.prefix + '-'),
  );
const deliver = (clock) =>
  execFileSync('./scripts/tool', ['node', 'tests/fixtures/recovery-deliver.mjs'], {
    env: { ...process.env, MARLEVA_RECOVERY_CLOCK: clock.toISOString() },
    timeout: 30000,
    stdio: 'pipe',
  });
try {
  for (const job of fixture.jobs)
    assert.equal(
      (await db.outbox.findUniqueOrThrow({ where: { id: job.id } })).state,
      job.kind === 'sending' ? 'sending' : 'pending',
    );
  report.cases.queueFromSamePhysicalBackup = true;
  const snapshot = await business();
  await db.$disconnect();
  docker(['restart', stack.names.db]);
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      docker(['exec', stack.names.db, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  assert.ok(ready);
  db = database();
  report.cases.postgresRestartPreservesQueue = true;
  docker(['stop', '--time', '10', stack.names.inbucket]);
  stopped = true;
  const clock = new Date(fixture.clock);
  deliver(clock);
  for (const job of fixture.jobs)
    assert.equal(
      (await db.outbox.findUniqueOrThrow({ where: { id: job.id } })).state,
      job.kind === 'expired' ? 'failed' : 'pending',
    );
  report.cases.smtpDownKeepsPendingAndExpiresOld = true;
  docker(['start', stack.names.inbucket]);
  stopped = false;
  ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      await messages(stack.environment.MAILPIT_URL);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert.ok(ready);
  deliver(new Date(+clock + 300001));
  assert.equal((await messages(stack.environment.MAILPIT_URL)).length, 2);
  deliver(new Date(+clock + 300002));
  assert.equal((await messages(stack.environment.MAILPIT_URL)).length, 2);
  assert.equal((await messages('http://127.0.0.1:54724')).length, 0);
  for (const job of fixture.jobs)
    assert.equal(
      (await db.outbox.findUniqueOrThrow({ where: { id: job.id } })).state,
      job.kind === 'expired' ? 'failed' : 'sent',
    );
  assert.deepEqual(await business(), snapshot);
  report.cases.newProcessesDeliverOnlyTargetWithoutRepeatingBusiness = true;
  report.result = 'PASS';
} catch (error) {
  report.result = 'FAIL';
  writeFileSync(context.folder + '/outbox-failure.private.log', String(error.stack), {
    mode: 0o600,
  });
  process.exitCode = 1;
} finally {
  if (stopped) docker(['start', stack.names.inbucket]);
  await db.$disconnect();
  report.durationMs = Date.now() - started;
  writeFileSync(context.report('outbox'), JSON.stringify(report, null, 2) + '\n');
}
if (report.result === 'PASS')
  console.log('B12: cola del mismo backup conservada tras reinicio, caída SMTP y nuevos procesos');
