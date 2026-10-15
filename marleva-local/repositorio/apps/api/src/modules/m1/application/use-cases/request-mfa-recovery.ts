import { fail } from '../../../../security.js';
import {
  recoveryProjection,
  type RecoveryActor,
  type RecoveryRecord,
} from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
export class RequestMfaRecovery {
  constructor(private readonly context: RecoveryContext) {}
  async execute(actor: RecoveryActor, reason: string, key: string) {
    this.context.recent(actor);
    const continued = await this.context.repository.atomic(actor.accountId, async (tx) => {
      await this.context.actor(tx, actor);
      const row = await tx.active(actor.accountId);
      if (this.canResume(row, actor)) {
        if (
          typeof row.providerState.authId !== 'string' ||
          !Array.isArray(row.providerState.factorIds) ||
          row.providerState.authId !== actor.authId
        )
          fail(503, 'DEPENDENCIA', 'El proceso requiere conciliación');
        row.providerState = {
          authId: row.providerState.authId,
          factorIds: row.providerState.factorIds,
          tokensEnvelope: this.context.secrets.seal(actor.tokens),
        };
        return recoveryProjection(await tx.save(row));
      }
      const repeated = await tx.byRequest(actor.accountId, key);
      if (!repeated) return null;
      if (repeated.requestHash !== this.context.secrets.fingerprint({ reason }))
        fail(409, 'IDEMPOTENCIA', 'La clave ya tiene otra solicitud');
      return recoveryProjection(repeated);
    });
    if (continued) return continued;
    const factors = await this.context.provider.factors(actor.authId);
    return this.context.repository.atomic(actor.accountId, async (tx) => {
      await this.context.actor(tx, actor);
      const repeated = await tx.byRequest(actor.accountId, key);
      if (repeated) {
        if (repeated.requestHash !== this.context.secrets.fingerprint({ reason }))
          fail(409, 'IDEMPOTENCIA', 'La clave ya tiene otra solicitud');
        return recoveryProjection(repeated);
      }
      const active = await tx.active(actor.accountId);
      if (active && active.expiresAt > this.context.clock())
        fail(409, 'RECUPERACION_ACTIVA', 'Consulta tu recuperación existente');
      if (active) {
        active.state = 'expired';
        this.context.clearPrivate(active);
        await tx.save(active);
      }
      if (
        factors.length > 1 ||
        (factors.length === 0 && !(await tx.requiresRecovery(actor.accountId)))
      )
        fail(409, 'FACTOR', 'La recuperación requiere un factor TOTP identificado');
      const row = await tx.create(this.context.newRecord(actor, key, reason, factors));
      await tx.audit(actor.accountId, 'recovery.requested', row.id);
      return recoveryProjection(row);
    });
  }
  private canResume(row: RecoveryRecord | null, actor: RecoveryActor): row is RecoveryRecord {
    return (
      !!row &&
      ['approved', 'executing', 'provider_pending'].includes(row.state) &&
      row.expiresAt > this.context.clock() &&
      !!row.approvedAt &&
      actor.authenticatedAt > row.approvedAt &&
      (!row.leaseUntil || row.leaseUntil <= this.context.clock())
    );
  }
}
