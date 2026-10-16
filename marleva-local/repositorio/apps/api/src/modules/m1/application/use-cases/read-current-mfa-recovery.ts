import type { RecoveryActor } from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
import { ReadMfaRecovery } from './read-mfa-recovery.js';
export class ReadCurrentMfaRecovery {
  constructor(
    private readonly context: RecoveryContext,
    private readonly read: ReadMfaRecovery,
  ) {}
  async execute(actor: RecoveryActor) {
    const id = await this.context.repository.atomic(actor.accountId, async (tx) => {
      await this.context.actor(tx, actor);
      const row = await tx.active(actor.accountId);
      if (row && row.accountId !== actor.accountId) throw new Error('Recuperación de cuenta ajena');
      return row?.id;
    });
    return { recuperacion: id ? await this.read.execute(actor, id) : null };
  }
}
