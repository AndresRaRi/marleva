import { HttpException } from '@nestjs/common';
import { fail } from '../../../../security.js';
import { recoveryProjection, type RecoveryActor } from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
export class VerifyRecoveryFactor {
  constructor(private readonly context: RecoveryContext) {}
  async execute(
    actor: RecoveryActor,
    id: string,
    version: number,
    key: string,
    capability: string,
    factorId: string,
    code: string,
  ) {
    const operation = this.context.key(actor, 'verify', key),
      body = { version, factorId, code };
    const claim = await this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      await tx.operationKey(operation, id);
      await this.context.owner(tx, actor, row);
      this.context.capability(row, actor, capability);
      if (row.factorId !== factorId) fail(403, 'FACTOR', 'Usa el factor de esta recuperación');
      if (row.operations[operation]?.status === 'failed') {
        this.context.replay(row, operation, body);
        fail(401, 'FACTOR', 'Revisa el código del autenticador');
      }
      this.context.state(
        row,
        ['reenrollment'],
        row.operations[operation]?.status === 'pending' ? row.version : version,
      );
      const resumed = row.operations[operation]?.status === 'pending';
      this.context.reserve(row, operation, body);
      return { row: await tx.save(row), resumed };
    });
    try {
      await this.context.provider.verify(actor.authId, factorId, code, actor.tokens, claim.resumed);
    } catch (error) {
      await this.failed(
        id,
        claim.row.leaseToken,
        operation,
        error instanceof HttpException && error.getStatus() === 401,
      );
      throw error;
    }
    return this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      await this.context.owner(tx, actor, row);
      this.context.capability(row, actor, capability);
      if (
        row.leaseToken !== claim.row.leaseToken ||
        !row.leaseUntil ||
        row.leaseUntil <= this.context.clock()
      )
        fail(409, 'LEASE', 'Consulta tu recuperación');
      row.state = 'completed';
      row.completedAt = this.context.clock();
      row.capabilityConsumedAt = this.context.clock();
      row.leaseToken = null;
      row.leaseUntil = null;
      this.context.clearPrivate(row);
      const result = recoveryProjection({ ...row, version: row.version + 1 });
      this.context.response(row, operation, body, result);
      await tx.revoke(actor.accountId);
      await tx.audit(actor.accountId, 'recovery.completed', id);
      await tx.save(row);
      return result;
    });
  }
  private failed(id: string, lease: string | null, operation: string, wrongCode: boolean) {
    return this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      if (row.leaseToken !== lease) return;
      row.leaseToken = null;
      row.leaseUntil = null;
      if (wrongCode) {
        row.capabilityAttempts++;
        row.operations[operation].status = 'failed';
      }
      if (
        row.capabilityAttempts >= 5 &&
        row.capabilityExpiresAt &&
        row.capabilityExpiresAt >= this.context.clock()
      )
        row.capabilityConsumedAt = this.context.clock();
      await tx.save(row);
    });
  }
}
