import type { Database } from '../../../../database.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type {
  RecoveryRepository,
  RecoveryTransaction,
} from '../../application/ports/recovery-repository.js';
import { activeRecoveryStates, type RecoveryRecord } from '../../domain/entities/mfa-recovery.js';
import { fail } from '../../../../security.js';
type Transaction = Prisma.TransactionClient;
const record = (value: unknown) => value as RecoveryRecord;
class RecoverySqlTransaction implements RecoveryTransaction {
  constructor(private readonly db: Transaction) {}
  async operationKey(key: string, id: string) {
    await this.db.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key},1402))`;
    const used = await this.db.$queryRaw<
      { id: string }[]
    >`SELECT id FROM marleva."MfaRecovery" WHERE operations ? ${key} AND id<>${id}::uuid LIMIT 1`;
    if (used.length) fail(409, 'IDEMPOTENCIA', 'La clave pertenece a otra recuperación');
  }
  async get(id: string) {
    const value = await this.db.mfaRecovery.findUnique({ where: { id } });
    return value ? record(value) : null;
  }
  async byRequest(accountId: string, requestKey: string) {
    const value = await this.db.mfaRecovery.findUnique({
      where: { accountId_requestKey: { accountId, requestKey } },
    });
    return value ? record(value) : null;
  }
  async requiresRecovery(accountId: string) {
    const latest = await this.db.mfaRecovery.findFirst({
      where: { accountId, approvedBy: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    return !!latest && latest.state !== 'completed';
  }
  async active(accountId: string) {
    const value = await this.db.mfaRecovery.findFirst({
      where: { accountId, state: { in: activeRecoveryStates } },
    });
    return value ? record(value) : null;
  }
  async create(value: RecoveryRecord) {
    return record(
      await this.db.mfaRecovery.create({
        data: {
          ...value,
          operations: value.operations as Prisma.InputJsonValue,
          providerState: value.providerState as Prisma.InputJsonValue,
        },
      }),
    );
  }
  async save(value: RecoveryRecord) {
    const { id, version, ...fields } = value;
    const result = await this.db.mfaRecovery.updateMany({
      where: { id, version },
      data: {
        ...fields,
        version: version + 1,
        operations: fields.operations as Prisma.InputJsonValue,
        providerState: fields.providerState as Prisma.InputJsonValue,
      },
    });
    if (result.count !== 1) fail(409, 'VERSION', 'Consulta el estado actualizado');
    return (await this.get(id))!;
  }
  async hasRole(accountId: string, role: 'm1_operator' | 'm1_access_admin') {
    const account = await this.db.account.findUnique({ where: { id: accountId } });
    if (account?.state !== 'active') return false;
    return !!(await this.db.roleAssignment.findFirst({
      where: { accountId, role, revokedAt: null },
    }));
  }
  async sessionActive(accountId: string, id: string) {
    return !!(await this.db.session.findFirst({ where: { id, accountId, revokedAt: null } }));
  }
  async revoke(accountId: string) {
    const now = new Date();
    await this.db.session.updateMany({
      where: { accountId, revokedAt: null },
      data: { revokedAt: now },
    });
    await this.db.fixtureAccess.updateMany({
      where: { accountId, revokedAt: null },
      data: { revokedAt: now },
    });
  }
  async audit(accountId: string, action: string, resourceId: string) {
    await this.db.audit.create({ data: { accountId, action, resourceId } });
  }
}
export class PrismaRecoveryRepository implements RecoveryRepository {
  constructor(private readonly db: Database) {}
  atomic<T>(lock: string, operation: (tx: RecoveryTransaction) => Promise<T>) {
    return this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lock},1401))`;
      return operation(new RecoverySqlTransaction(tx));
    });
  }
  async get(id: string) {
    const value = await this.db.mfaRecovery.findUnique({ where: { id } });
    return value ? record(value) : null;
  }
  async cleanups() {
    const rows = await this.db.$queryRaw<unknown[]>`SELECT * FROM marleva."MfaRecovery" r WHERE
      (r."expiresAt"<=now() AND r.state IN ('requested','approved','executing','provider_pending','reenrollment')) OR
      EXISTS(SELECT 1 FROM jsonb_each(r.operations) AS o WHERE o.value ? 'response' AND o.value ? 'expiresAt' AND (o.value->>'expiresAt')::timestamptz<=now())
      ORDER BY r."expiresAt" LIMIT 10`;
    return rows.map(record);
  }
  async pending() {
    return (
      await this.db.mfaRecovery.findMany({
        where: { state: { in: ['approved', 'executing', 'provider_pending'] } },
        take: 10,
        orderBy: { createdAt: 'asc' },
      })
    ).map(record);
  }
}
