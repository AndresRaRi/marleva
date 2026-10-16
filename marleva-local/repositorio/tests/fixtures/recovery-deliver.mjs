import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { recoveryContext } from './recovery-context.mjs';
const context = recoveryContext();
assert.ok(context.isolated);
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
process.loadEnvFile(context.envFile);
const copy = JSON.parse(readFileSync(context.report('copy')));
const stack = JSON.parse(readFileSync(context.folder + '/provider/stack.private.json'));
assert.equal(stack.copyPrefix, copy.names.prefix);
Object.assign(process.env, stack.environment);
const fixture = JSON.parse(readFileSync(context.fixture));
const ids = new Set(fixture.jobs.map((job) => job.id));
const clock = new Date(process.env.MARLEVA_RECOVERY_CLOCK);
assert.ok(Number.isFinite(+clock));
const { database } = await import('../../apps/api/dist/database.js');
const { PrismaOutboxRepository } =
  await import('../../apps/api/dist/modules/m1/infrastructure/repositories/prisma-outbox-repository.js');
const { SmtpOutboxMailer } =
  await import('../../apps/api/dist/modules/m1/infrastructure/adapters/smtp-outbox-mailer.js');
const { DeliverOutbox } =
  await import('../../apps/api/dist/modules/m1/application/use-cases/deliver-outbox.js');
const db = database(),
  mail = new SmtpOutboxMailer(),
  repository = new PrismaOutboxRepository(db);
const scoped = {
  ready: async (now) => (await repository.ready(now)).filter((job) => ids.has(job.id)),
  claim: (...args) => repository.claim(...args),
  expire: (...args) => repository.expire(...args),
  complete: (...args) => repository.complete(...args),
  retry: (...args) => repository.retry(...args),
};
try {
  await new DeliverOutbox(scoped, mail, () => clock).execute();
} finally {
  mail.close();
  await db.$disconnect();
}
