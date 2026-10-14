import { fail } from '../../../../security.js';
import type { RecoveryReviewer, RecoveryReviewPermissions } from '../ports/recovery-review.js';
export class AuthorizeRecoveryReview {
  constructor(
    private readonly permissions: RecoveryReviewPermissions,
    private readonly clock = () => new Date(),
  ) {}
  async execute(reviewer: RecoveryReviewer, ownerId: string) {
    if (reviewer.accountId === ownerId)
      fail(403, 'RECUPERACION_PROPIA', 'Otro administrador debe revisar tu solicitud');
    const elapsed = +this.clock() - +reviewer.authenticatedAt;
    if (elapsed < 0 || elapsed >= 300000 || !Number.isFinite(elapsed))
      fail(403, 'REAUTENTICACION', 'Inicia sesión de nuevo para revisar');
    if (!(await this.permissions.accessAdmin(reviewer.accountId)))
      fail(403, 'PERMISO', 'No tienes permiso para revisar');
    if ((await this.permissions.assurance(reviewer.sessionId)) !== 'aal2')
      fail(403, 'MFA', 'Verifica tu segundo factor');
  }
}
