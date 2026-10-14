import { fail } from '../../../../security.js';
import { recoveryProjection, type RecoveryActor } from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
export class ReviewMfaRecovery {
  constructor(private readonly context: RecoveryContext) {}
  async execute(
    actor: RecoveryActor,
    id: string,
    version: number,
    key: string,
    decision: 'approve' | 'reject',
    reason?: string,
  ) {
    if (
      decision === 'reject' &&
      (typeof reason !== 'string' || !reason.trim() || reason.length > 500)
    )
      fail(422, 'MOTIVO', 'Escribe un motivo de revisión');
    const level = await this.context.provider.assurance(actor.tokens);
    const operation = this.context.key(actor, decision, key),
      body = { version, reason: reason ?? '' };
    return this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      await tx.operationKey(operation, id);
      await this.context.review(tx, actor, row, level);
      const replay = this.context.replay(row, operation, body);
      if (replay) return replay;
      this.context.state(row, ['requested'], version);
      if (decision === 'approve') {
        row.approvedBy = actor.accountId;
        row.approvedAt = this.context.clock();
        row.state = 'approved';
        row.providerReference = row.id;
        await tx.revoke(row.accountId);
      } else {
        row.state = 'rejected';
        this.context.clearPrivate(row);
      }
      const result = recoveryProjection({ ...row, version: row.version + 1 });
      this.context.response(row, operation, body, result);
      if (decision === 'reject') row.operations[operation].reason = reason;
      await tx.audit(actor.accountId, 'recovery.' + decision, id);
      await tx.save(row);
      return result;
    });
  }
}
