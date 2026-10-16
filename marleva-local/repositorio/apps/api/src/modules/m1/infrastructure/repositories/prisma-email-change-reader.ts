import type { Database } from '../../../../database.js';
import type { EmailChangeReader } from '../../application/ports/email-change-reader.js';
export class PrismaEmailChangeReader implements EmailChangeReader {
  constructor(private readonly db: Database) {}
  latest(accountId: string) {
    return this.db.emailChange.findFirst({
      where: { accountId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        accountId: true,
        oldEmail: true,
        newEmail: true,
        oldConfirmed: true,
        newConfirmed: true,
        state: true,
        expiresAt: true,
      },
    });
  }
}
