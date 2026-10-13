import type { Database } from './database.js';
import type { AccountService } from './account.service.js';
import { DeliverOutbox } from './modules/m1/application/use-cases/deliver-outbox.js';
import { PrismaOutboxRepository } from './modules/m1/infrastructure/repositories/prisma-outbox-repository.js';
import { SmtpOutboxMailer } from './modules/m1/infrastructure/adapters/smtp-outbox-mailer.js';
export function startWorker(db: Database, accounts: AccountService) {
  const mail = new SmtpOutboxMailer();
  const deliver = new DeliverOutbox(new PrismaOutboxRepository(db), mail);
  let active = false;
  async function tick() {
    if (active) return;
    active = true;
    try {
      await accounts.reconcile();
      await deliver.execute();
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
