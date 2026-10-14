import { fail } from '../../../../security.js';
import type { RecoveryActor, RecoveryEnrollment } from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
export class EnrollRecoveryFactor {
  constructor(private readonly context: RecoveryContext) {}
  async execute(
    actor: RecoveryActor,
    id: string,
    version: number,
    key: string,
    capability: string,
  ) {
    const operation = this.context.key(actor, 'enroll', key),
      body = { version };
    const claimed = await this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      await tx.operationKey(operation, id);
      await this.context.owner(tx, actor, row);
      this.context.capability(row, actor, capability);
      const replay = this.context.replay(row, operation, body);
      if (replay) return { response: replay, row: null };
      this.context.state(
        row,
        ['reenrollment'],
        row.operations[operation]?.status === 'pending' ? row.version : version,
      );
      this.context.reserve(row, operation, body);
      return { response: null, row: await tx.save(row) };
    });
    if (claimed.response) return claimed.response;
    const claim = claimed.row!;
    let enrollment: RecoveryEnrollment;
    try {
      enrollment = await this.context.provider.enroll(actor.authId, id, actor.tokens);
    } catch (error) {
      await this.release(id, claim.leaseToken);
      throw error;
    }
    return this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      await this.context.owner(tx, actor, row);
      this.context.capability(row, actor, capability);
      if (
        row.leaseToken !== claim.leaseToken ||
        !row.leaseUntil ||
        row.leaseUntil <= this.context.clock()
      )
        fail(409, 'LEASE', 'Consulta el estado antes de repetir');
      row.factorId = enrollment.factor_id;
      row.leaseToken = null;
      row.leaseUntil = null;
      this.context.response(row, operation, body, enrollment, row.capabilityExpiresAt!);
      await tx.save(row);
      return enrollment;
    });
  }
  private release(id: string, lease: string | null) {
    return this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      if (row.leaseToken !== lease) return;
      row.leaseToken = null;
      row.leaseUntil = null;
      await tx.save(row);
    });
  }
}
