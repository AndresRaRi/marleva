import type { Database } from '../../../../database.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type {
  SessionRecord,
  ChallengeRecord,
  EmailChangeRecord,
} from '../../domain/account-records.js';
import type { AccountData, AccountRepository } from '../../application/ports/account-repository.js';
class PrismaAccountData implements AccountData {
  constructor(protected readonly db: Prisma.TransactionClient) {}
  lockOrigin(origin: string) {
    return this.db.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${origin}, 1101))`;
  }
  lockKey(key: string) {
    return this.db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  }
  latestChallenge(address: string) {
    return this.db.challenge.findFirst({
      where: { email: address },
      orderBy: { createdAt: 'desc' },
    });
  }
  recentOrigin(origin: string, since: Date) {
    return this.db.challenge.findMany({
      where: { origin, createdAt: { gt: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }
  supersedeChallenges(address: string) {
    return this.db.challenge.updateMany({
      where: { email: address, state: { in: ['open', 'sending'] } },
      data: { state: 'superseded' },
    });
  }
  createChallenge(data: Pick<ChallengeRecord, 'id' | 'email' | 'origin' | 'expiresAt'>) {
    return this.db.challenge.create({ data });
  }
  challenge(id: string) {
    return this.db.challenge.findUnique({ where: { id } });
  }
  requiredChallenge(id: string) {
    return this.db.challenge.findUniqueOrThrow({ where: { id } });
  }
  claimChallenge(id: string) {
    return this.db.challenge.update({
      where: { id },
      data: { state: 'verifying', attempts: { increment: 1 } },
    });
  }
  updateChallenge(id: string, data: Partial<Pick<ChallengeRecord, 'state' | 'blockedUntil'>>) {
    return this.db.challenge.update({ where: { id }, data });
  }
  openSentChallenge(id: string) {
    return this.db.challenge.updateMany({
      where: { id, state: 'sending' },
      data: { state: 'open' },
    });
  }
  accountForAuth(authId: string, address: string) {
    return this.db.account.upsert({
      where: { authId },
      create: { authId, email: address },
      update: {},
    });
  }
  createSession(
    data: Pick<SessionRecord, 'accountId' | 'tokenHash' | 'csrfHash' | 'providerTokens'>,
  ) {
    return this.db.session.create({ data });
  }
  audit(data: { accountId: string; action: string; resourceId?: string }) {
    return this.db.audit.create({ data });
  }
  sessionByHash(hash: string) {
    return this.db.session.findUnique({ where: { tokenHash: hash }, include: { account: true } });
  }
  touchSession(id: string, now: Date) {
    return this.db.session.updateMany({ where: { id, revokedAt: null }, data: { lastSeen: now } });
  }
  requiredAccount(id: string) {
    return this.db.account.findUniqueOrThrow({ where: { id } });
  }
  updateSession(
    id: string,
    data: Partial<
      Pick<SessionRecord, 'revokedAt' | 'refreshLease' | 'csrfHash' | 'providerTokens'>
    >,
  ) {
    return this.db.session.update({ where: { id }, data });
  }
  claimRefresh(id: string, now: Date, until: Date) {
    return this.db.session.updateMany({
      where: { id, revokedAt: null, OR: [{ refreshLease: null }, { refreshLease: { lt: now } }] },
      data: { refreshLease: until },
    });
  }
  storeTokensIfActive(id: string, providerTokens: string) {
    return this.db.session.updateMany({ where: { id, revokedAt: null }, data: { providerTokens } });
  }
  requiredSession(id: string) {
    return this.db.session.findUniqueOrThrow({ where: { id } });
  }
  revokeSessions(target: { accountId: string } | { id: string }, now: Date) {
    return this.db.session.updateMany({ where: target, data: { revokedAt: now } });
  }
  accountForEmail(address: string) {
    return this.db.account.findUnique({ where: { email: address } });
  }
  activeEmailChange(accountId: string, now: Date) {
    return this.db.emailChange.findFirst({
      where: {
        accountId,
        OR: [
          { state: { in: ['open', 'sending', 'verifying'] }, expiresAt: { gt: now } },
          { state: 'reconcile' },
        ],
      },
    });
  }
  createEmailChange(
    data: Pick<
      EmailChangeRecord,
      'id' | 'accountId' | 'oldEmail' | 'newEmail' | 'providerTokens' | 'expiresAt'
    >,
  ) {
    return this.db.emailChange.create({ data });
  }
  updateEmailChange(
    id: string,
    data: Partial<
      Pick<EmailChangeRecord, 'state' | 'providerTokens' | 'oldConfirmed' | 'newConfirmed'>
    >,
  ) {
    return this.db.emailChange.update({ where: { id }, data });
  }
  emailChange(id: string) {
    return this.db.emailChange.findUnique({ where: { id } });
  }
  claimEmailChange(id: string) {
    return this.db.emailChange.update({
      where: { id },
      data: { state: 'verifying', attempts: { increment: 1 } },
    });
  }
  requiredEmailChange(id: string) {
    return this.db.emailChange.findUniqueOrThrow({ where: { id } });
  }
  setAccountEmail(id: string, address: string) {
    return this.db.account.update({ where: { id }, data: { email: address } });
  }
  notice(data: { accountId: string; kind: string; text: string }) {
    return this.db.notice.create({ data });
  }
  outbox(data: { reference: string; recipient: string; subject: string; text: string }) {
    return this.db.outbox.create({ data });
  }
  activeRecovery(accountId: string, now: Date) {
    return this.db.mfaRecovery.findFirst({
      where: {
        accountId,
        state: { in: ['requested', 'approved', 'executing', 'provider_pending', 'reenrollment'] },
        expiresAt: { gt: now },
      },
    });
  }
  latestApprovedRecovery(accountId: string) {
    return this.db.mfaRecovery.findFirst({
      where: { accountId, approvedBy: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
  }
  emailReconciliations() {
    return this.db.emailChange.findMany({
      where: {
        state: { in: ['reconcile', 'verifying', 'open'] },
        newConfirmed: true,
        oldConfirmed: true,
      },
      take: 10,
    });
  }
}
export class PrismaAccountRepository extends PrismaAccountData implements AccountRepository {
  constructor(private readonly source: Database) {
    super(source);
  }
  transaction<T>(work: (data: AccountData) => Promise<T>) {
    return this.source.$transaction((tx) => work(new PrismaAccountData(tx)));
  }
}
