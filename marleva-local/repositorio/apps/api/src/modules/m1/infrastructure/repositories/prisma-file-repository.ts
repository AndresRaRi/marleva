import type { Database } from '../../../../database.js';
import { limits } from '../../../../config.js';
import { Prisma } from '../../../../generated/prisma/client.js';
import type {
  FileActor,
  FileRepository,
  DeletionJob,
} from '../../application/ports/file-repository.js';
import { FileFault } from '../../domain/file-fault.js';
import { fileExpiry } from '../../domain/file-policy.js';

type Tx = Prisma.TransactionClient;
export class PrismaFileRepository implements FileRepository {
  constructor(private readonly db: Database) {}
  private async lock(tx: Tx, actor: FileActor, now: Date) {
    // Serialize B09 operations for this owner; account/session locks also fence logout.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${actor.accountId}, 911))::text`;
    await tx.$queryRaw`SELECT id FROM marleva."Account" WHERE id=${actor.accountId}::uuid FOR SHARE`;
    await tx.$queryRaw`SELECT id FROM marleva."Session" WHERE id=${actor.sessionId}::uuid FOR SHARE`;
    const account = await tx.account.findUnique({ where: { id: actor.accountId } });
    const session = await tx.session.findUnique({ where: { id: actor.sessionId } });
    if (
      !account ||
      account.state !== 'active' ||
      !session ||
      session.accountId !== account.id ||
      session.revokedAt
    )
      throw new FileFault('session');
    const max = (account.operator ? limits.operator_max_seconds : limits.user_max_seconds) * 1000;
    const idle =
      (account.operator ? limits.operator_idle_seconds : limits.user_idle_seconds) * 1000;
    const expiry = new Date(Math.min(+session.createdAt + max, +session.lastSeen + idle));
    if (+expiry <= +now) throw new FileFault('session');
    return expiry;
  }
  private async fixture(tx: Tx, actor: FileActor, id: string) {
    const item = await tx.privateFixture.findUnique({ where: { id } });
    if (!item || item.accountId !== actor.accountId || item.state !== 'available')
      throw new FileFault('missing');
    return item;
  }
  issue(actor: FileActor, id: string, tokenHash: string, now: Date) {
    return this.db.$transaction(async (tx) => {
      const sessionExpiry = await this.lock(tx, actor, now);
      now = new Date(Math.max(+now, Date.now()));
      await this.fixture(tx, actor, id);
      const recent = await tx.fixtureAccess.findMany({
        where: { sessionId: actor.sessionId, createdAt: { gt: new Date(+now - 60000) } },
        orderBy: { createdAt: 'asc' },
      });
      if (recent.length >= 10)
        throw new FileFault(
          'limit',
          Math.max(1, Math.ceil((+recent[recent.length - 10].createdAt + 60000 - +now) / 1000)),
        );
      await tx.fixtureAccess.updateMany({
        where: { fixtureId: id, sessionId: actor.sessionId, revokedAt: null },
        data: { revokedAt: now },
      });
      const expiresAt = fileExpiry(now, sessionExpiry);
      await tx.fixtureAccess.create({
        data: {
          fixtureId: id,
          accountId: actor.accountId,
          sessionId: actor.sessionId,
          tokenHash,
          createdAt: now,
          expiresAt,
        },
      });
      return expiresAt;
    });
  }
  authorize(actor: FileActor, id: string, tokenHash: string, now: Date) {
    return this.db.$transaction(async (tx) => {
      await this.lock(tx, actor, now);
      const item = await this.fixture(tx, actor, id);
      const access = await tx.fixtureAccess.findUnique({ where: { tokenHash } });
      if (
        !access ||
        access.fixtureId !== id ||
        access.accountId !== actor.accountId ||
        access.sessionId !== actor.sessionId ||
        access.revokedAt ||
        +access.expiresAt <= +now
      )
        throw new FileFault('capability');
      return {
        id: item.id,
        objectKey: item.objectKey,
        bytes: item.bytes,
        sha256: item.sha256,
        mimeType: item.mimeType,
      };
    });
  }
  delete(
    actor: FileActor,
    id: string,
    key: string,
    version: number,
    requestHash: string,
    now: Date,
  ) {
    return this.db.$transaction(async (tx) => {
      await this.lock(tx, actor, now);
      const previous = await tx.fixtureDeletion.findUnique({
        where: { accountId_idempotencyKey: { accountId: actor.accountId, idempotencyKey: key } },
      });
      if (previous) {
        if (previous.requestHash !== requestHash || previous.fixtureId !== id)
          throw new FileFault('conflict');
        const item = await tx.privateFixture.findUniqueOrThrow({ where: { id } });
        return {
          fixture_id: id,
          task_id: previous.id,
          estado: item.state === 'deleted' ? ('deleted' as const) : ('delete_pending' as const),
          version: item.version,
        };
      }
      const existing = await tx.privateFixture.findUnique({ where: { id } });
      if (existing?.accountId === actor.accountId && existing.state !== 'available')
        throw new FileFault('conflict');
      const item = await this.fixture(tx, actor, id);
      now = new Date(Math.max(+now, Date.now()));
      if (item.version !== version) throw new FileFault('conflict');
      await tx.privateFixture.update({
        where: { id },
        data: { state: 'delete_pending', deleteRequestedAt: now, version: { increment: 1 } },
      });
      await tx.fixtureAccess.updateMany({
        where: { fixtureId: id, revokedAt: null },
        data: { revokedAt: now },
      });
      const task = await tx.fixtureDeletion.create({
        data: {
          fixtureId: id,
          accountId: actor.accountId,
          idempotencyKey: key,
          requestHash,
          expectedVersion: version,
          createdAt: now,
          dueAt: now,
        },
      });
      return {
        fixture_id: id,
        task_id: task.id,
        estado: 'delete_pending' as const,
        version: item.version + 1,
      };
    });
  }
  async ready(now: Date): Promise<DeletionJob[]> {
    const tasks = await this.db.fixtureDeletion.findMany({
      where: {
        state: { in: ['pending', 'processing'] },
        dueAt: { lte: now },
        OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
      },
      include: { fixture: true },
      orderBy: { dueAt: 'asc' },
      take: 20,
    });
    return tasks.map((task) => ({
      id: task.id,
      fixtureId: task.fixtureId,
      objectKey: task.fixture.objectKey,
      attempts: task.attempts,
    }));
  }
  async claim(job: DeletionJob, now: Date, lease: Date) {
    const result = await this.db.fixtureDeletion.updateMany({
      where: {
        id: job.id,
        attempts: job.attempts,
        state: { in: ['pending', 'processing'] },
        dueAt: { lte: now },
        OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
      },
      data: { state: 'processing', leaseUntil: lease, attempts: { increment: 1 } },
    });
    return result.count === 1;
  }
  async complete(job: DeletionJob, lease: Date, now: Date) {
    await this.db.$transaction(async (tx) => {
      const result = await tx.fixtureDeletion.updateMany({
        where: { id: job.id, state: 'processing', leaseUntil: lease },
        data: { state: 'completed', completedAt: now, leaseUntil: null },
      });
      if (result.count)
        await tx.privateFixture.update({
          where: { id: job.fixtureId },
          data: { state: 'deleted', deletedAt: now },
        });
    });
  }
  async retry(id: string, lease: Date, dueAt: Date) {
    await this.db.fixtureDeletion.updateMany({
      where: { id, state: 'processing', leaseUntil: lease },
      data: { state: 'pending', dueAt, leaseUntil: null },
    });
  }
}
