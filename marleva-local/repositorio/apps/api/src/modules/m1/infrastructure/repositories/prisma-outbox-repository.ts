import type { Database } from '../../../../database.js';
import type { OutboxItem, OutboxRepository } from '../../application/ports/outbox-repository.js';
export class PrismaOutboxRepository implements OutboxRepository {
  constructor(private readonly db: Database) {}
  private available(now: Date) {
    return {
      state: { in: ['pending', 'sending'] },
      dueAt: { lte: now },
      OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
    };
  }
  ready(now: Date) {
    return this.db.outbox.findMany({
      where: this.available(now),
      take: 10,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }
  async expire(item: OutboxItem, now: Date) {
    await this.db.outbox.updateMany({
      where: { id: item.id, attempts: item.attempts, ...this.available(now) },
      data: { state: 'failed', leaseUntil: null },
    });
  }
  async claim(item: OutboxItem, now: Date, lease: Date) {
    const result = await this.db.outbox.updateMany({
      where: { id: item.id, attempts: item.attempts, ...this.available(now) },
      data: { state: 'sending', leaseUntil: lease, attempts: { increment: 1 } },
    });
    return result.count === 1;
  }
  async complete(id: string, lease: Date) {
    await this.db.outbox.updateMany({
      where: { id, state: 'sending', leaseUntil: lease },
      data: { state: 'sent', leaseUntil: null },
    });
  }
  async retry(id: string, lease: Date, dueAt: Date, expired: boolean) {
    await this.db.outbox.updateMany({
      where: { id, state: 'sending', leaseUntil: lease },
      data: { state: expired ? 'failed' : 'pending', leaseUntil: null, dueAt },
    });
  }
}
