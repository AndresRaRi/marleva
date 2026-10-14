import { fail } from '../../../../security.js';
import type { RecoveryActor } from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
export class IssueRecoveryCapability {
  constructor(private readonly context: RecoveryContext) {}
  execute(actor: RecoveryActor, id: string, version: number, key: string) {
    const operation = this.context.key(actor, 'capability', key),
      body = { version };
    return this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      await tx.operationKey(operation, id);
      await this.context.owner(tx, actor, row);
      const barrier = Math.max(+(row.approvedAt ?? 0), +(row.capabilityConsumedAt ?? 0));
      if (+actor.authenticatedAt <= barrier)
        fail(403, 'REAUTENTICACION', 'Inicia sesión de nuevo por correo');
      const replay = this.context.replay(row, operation, body);
      if (replay) {
        this.context.capability(row, actor, (replay as { capability: string }).capability);
        return replay;
      }
      this.context.state(row, ['reenrollment'], version);
      if (row.leaseUntil && row.leaseUntil > this.context.clock())
        fail(409, 'OCUPADA', 'Espera a que termine la operación actual');
      const capability = this.context.secrets.random(),
        expires = new Date(Math.min(+this.context.clock() + 600000, +row.expiresAt));
      row.capabilityHash = this.context.secrets.hash(capability);
      row.capabilitySessionId = actor.sessionId;
      row.capabilityExpiresAt = expires;
      row.capabilityAttempts = 0;
      row.capabilityConsumedAt = null;
      const result = { capability, expires_at: expires.toISOString() };
      this.context.response(row, operation, body, result, expires);
      await tx.save(row);
      return result;
    });
  }
}
