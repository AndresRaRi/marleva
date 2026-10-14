import { fail } from '../../../../security.js';
import {
  recoveryProjection,
  activeRecoveryStates,
  type RecoveryActor,
} from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
export class ReadMfaRecovery {
  constructor(private readonly context: RecoveryContext) {}
  async execute(actor: RecoveryActor, id: string) {
    const level = await this.context.provider.assurance(actor.tokens);
    return this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      await this.context.actor(tx, actor);
      if (row.accountId === actor.accountId) await this.context.actor(tx, actor);
      else if (!(await tx.hasRole(actor.accountId, 'm1_access_admin')) || level !== 'aal2')
        fail(404, 'RECUPERACION', 'Recuperación no disponible');
      if (activeRecoveryStates.includes(row.state) && row.expiresAt <= this.context.clock()) {
        row.state = 'expired';
        this.context.clearPrivate(row);
        return recoveryProjection(await tx.save(row));
      }
      return recoveryProjection(row);
    });
  }
}
