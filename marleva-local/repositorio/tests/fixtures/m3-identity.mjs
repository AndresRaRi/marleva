import { randomBytes } from 'node:crypto';
import { CatalogError } from '../../apps/api/dist-m3/modules/m3/domain/catalog.js';
// Test provider only. It emits no sessions, calls no M1 service and validates no real person/MFA.
export class FixtureIdentity {
  sessions = new Map();
  issue(actor) {
    const token = randomBytes(32).toString('hex');
    this.sessions.set(token, {
      ...actor,
      csrfToken: randomBytes(24).toString('hex'),
      expires: Date.now() + 3600000,
    });
    return token;
  }
  async resolve(request) {
    const token =
      request.authorization?.replace(/^Bearer /u, '') ??
      request.cookie?.match(/(?:^|;\s*)m3_fixture_session=([a-f0-9]{64})(?:;|$)/u)?.[1];
    const session = this.sessions.get(token);
    if (!session || session.expires <= Date.now() || session.revoked)
      throw new CatalogError(401, 'SESSION', 'Inicia sesión para continuar.');
    if (request.cookie && request.mutation && request.csrfToken !== session.csrfToken)
      throw new CatalogError(403, 'CSRF', 'Actualiza la sesión antes de continuar.');
    return {
      id: session.id,
      reviewer: session.reviewer,
      mfa: session.mfa,
      csrfToken: session.csrfToken,
    };
  }
}
