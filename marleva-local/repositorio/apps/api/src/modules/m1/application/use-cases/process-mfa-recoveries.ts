import { randomUUID } from 'node:crypto';
import type { RecoveryTokens, RecoveryProviderState } from '../../domain/entities/mfa-recovery.js';
import { RecoveryContext } from './recovery-context.js';
export class ProcessMfaRecoveries {
  constructor(private readonly context: RecoveryContext) {}
  async execute() {
    for (const candidate of await this.context.repository.cleanups()) {
      await this.context.repository.atomic(candidate.id, async (tx) => {
        const row = this.context.required(await tx.get(candidate.id));
        if (
          row.expiresAt <= this.context.clock() &&
          ['requested', 'approved', 'executing', 'provider_pending', 'reenrollment'].includes(
            row.state,
          )
        ) {
          row.state = 'expired';
          row.leaseToken = null;
          row.leaseUntil = null;
          this.context.clearPrivate(row);
        }
        for (const op of Object.values(row.operations))
          if (op.expiresAt && new Date(op.expiresAt) <= this.context.clock()) delete op.response;
        await tx.save(row);
      });
    }
    for (const candidate of await this.context.repository.pending())
      await this.process(candidate.id);
  }
  private async process(id: string) {
    const claim = await this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      if (!['approved', 'executing', 'provider_pending'].includes(row.state)) return null;
      if (row.leaseUntil && row.leaseUntil > this.context.clock()) return null;
      if (row.expiresAt <= this.context.clock()) {
        row.state = 'expired';
        this.context.clearPrivate(row);
        await tx.save(row);
        return null;
      }
      row.leaseToken = randomUUID();
      row.leaseUntil = new Date(+this.context.clock() + 180000);
      row.state = 'executing';
      return tx.save(row);
    });
    if (!claim) return;
    let succeeded = false;
    try {
      const state = claim.providerState as RecoveryProviderState;
      await this.context.provider.reset(
        state.authId,
        state.factorIds,
        this.context.secrets.unseal<RecoveryTokens>(state.tokensEnvelope),
      );
      succeeded = true;
    } catch {
      /* No result is interpreted as success; durable state remains retryable. */
    }
    await this.context.repository.atomic(id, async (tx) => {
      const row = this.context.required(await tx.get(id));
      if (
        row.leaseToken !== claim.leaseToken ||
        !row.leaseUntil ||
        row.leaseUntil <= this.context.clock()
      )
        return;
      row.state = succeeded ? 'reenrollment' : 'provider_pending';
      row.leaseToken = null;
      row.leaseUntil = null;
      if (succeeded) {
        await tx.revoke(row.accountId);
        row.approvedAt = this.context.clock();
        row.providerState = {};
      }
      await tx.save(row);
    });
  }
}
