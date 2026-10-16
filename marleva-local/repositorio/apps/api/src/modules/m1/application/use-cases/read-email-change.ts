import type { EmailChangeReader } from '../ports/email-change-reader.js';
import { emailChangeStatus } from '../../domain/email-change-status.js';
export class ReadEmailChange {
  constructor(
    private readonly reader: EmailChangeReader,
    private readonly now = () => new Date(),
  ) {}
  async execute(accountId: string) {
    const change = await this.reader.latest(accountId);
    if (!change) return { cambio: null };
    if (change.accountId !== accountId) throw new Error('Cambio de cuenta ajena');
    return {
      cambio: {
        id: change.id,
        account_id: change.accountId,
        correo_actual: change.oldEmail,
        correo_nuevo: change.newEmail,
        actual_confirmado: change.oldConfirmed,
        nuevo_confirmado: change.newConfirmed,
        estado: emailChangeStatus(change.state, change.expiresAt, this.now()),
        vence_en: change.expiresAt.toISOString(),
      },
    };
  }
}
