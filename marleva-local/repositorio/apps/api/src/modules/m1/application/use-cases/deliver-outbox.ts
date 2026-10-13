import type { OutboxRepository, OutboxMailer } from '../ports/outbox-repository.js';
import { deliveryExpired, deliveryRetryAt } from '../../domain/outbox-policy.js';
export class DeliverOutbox {
  constructor(
    private readonly repository: OutboxRepository,
    private readonly mailer: OutboxMailer,
    private readonly clock = () => new Date(),
  ) {}
  async execute() {
    for (const item of await this.repository.ready(this.clock())) {
      const now = this.clock();
      if (deliveryExpired(item.createdAt, now)) {
        await this.repository.expire(item, now);
        continue;
      }
      const lease = new Date(+now + 15000);
      if (!(await this.repository.claim(item, now, lease))) continue;
      try {
        await this.mailer.send(item);
        await this.repository.complete(item.id, lease);
      } catch {
        const failedAt = this.clock();
        await this.repository.retry(
          item.id,
          lease,
          deliveryRetryAt(item.attempts, failedAt),
          deliveryExpired(item.createdAt, failedAt),
        );
      }
    }
  }
}
