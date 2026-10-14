import type { ProcessMfaRecoveries } from './modules/m1/application/use-cases/process-mfa-recoveries.js';
import { ProcessFileDeletions } from './modules/m1/application/use-cases/process-file-deletions.js';
import { PrismaFileRepository } from './modules/m1/infrastructure/repositories/prisma-file-repository.js';
import { LocalPrivateStorage } from './modules/m1/infrastructure/adapters/local-private-storage.js';
import type { Database } from './database.js';
import type { AccountService } from './account.service.js';
import { DeliverOutbox } from './modules/m1/application/use-cases/deliver-outbox.js';
import { PrismaOutboxRepository } from './modules/m1/infrastructure/repositories/prisma-outbox-repository.js';
import { SmtpOutboxMailer } from './modules/m1/infrastructure/adapters/smtp-outbox-mailer.js';
export function startWorker(
  db: Database,
  accounts: AccountService,
  recoveries?: ProcessMfaRecoveries,
) {
  const mail = new SmtpOutboxMailer();
  const deliver = new DeliverOutbox(new PrismaOutboxRepository(db), mail);
  const deletion = new ProcessFileDeletions(
    new PrismaFileRepository(db),
    new LocalPrivateStorage(),
  );
  let active = false;
  async function tick() {
    if (active) return;
    active = true;
    try {
      // Each durable queue progresses even when another dependency fails.
      await Promise.allSettled([
        accounts.reconcile(),
        deliver.execute(),
        deletion.execute(),
        recoveries?.execute(),
      ]);
    } catch {
      /* Durable tasks remain available; never log secrets. */
    } finally {
      active = false;
    }
  }
  const timer = setInterval(() => void tick(), 1000);
  timer.unref();
  void tick();
  return () => {
    clearInterval(timer);
    mail.close();
  };
}
