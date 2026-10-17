import type {
  SessionAccountRepository,
  SessionIdentity,
  SessionCredentials,
} from '../ports/session-account.js';
import type { AccountSecrets } from '../ports/account-secrets.js';
import { limits, config } from '../../../../config.js';
import { digest, secret, equalHash, fail } from '../../../../security.js';

import {
  type AccountPrincipal,
  type AccountTokens,
  type AccountRecord,
  type SessionRecord,
} from '../../domain/account-records.js';
const seconds = (n: number) => new Date(Date.now() + n * 1000);
export class AccountSessions {
  constructor(
    private readonly repo: SessionAccountRepository,
    private readonly identity: SessionIdentity,
    private readonly secrets: AccountSecrets,
  ) {}
  async principal(req: SessionCredentials, mutating = false): Promise<AccountPrincipal> {
    const { token, bearer } = this.sessionCredential(req);
    const s = await this.repo.sessionByHash(digest(token));
    const now = Date.now();
    if (!s || s.revokedAt || s.account.state !== 'active')
      fail(401, 'SESION', 'La sesión terminó', 'Inicia sesión de nuevo');
    await this.sessionFresh(s, now);
    this.sessionCsrf(req, s, mutating, bearer);
    const t = await this.providerSession(s);
    const { data, error } = await this.identity.user(t.access_token);
    if (error || data.user?.id !== s.account.authId) fail(401, 'SESION', 'Inicia sesión de nuevo');
    const still = await this.repo.touchSession(s.id, new Date());
    if (!still.count) fail(401, 'SESION', 'La sesión terminó');
    const current = await this.repo.requiredAccount(s.accountId);
    if (current.state !== 'active') fail(403, 'CUENTA', 'Tu cuenta no está habilitada');
    return { session: s, account: current, tokens: t };
  }
  private sessionCredential(req: SessionCredentials) {
    const bearer = req.native;
    // Browser credentials always use cookies and exact origin checks.
    if (bearer && req.origin) fail(403, 'ORIGEN', 'Acceso no permitido');
    const token = req.token;
    if (typeof token !== 'string' || token.length > 200)
      fail(401, 'SESION', 'Inicia sesión para continuar');
    return { token, bearer };
  }
  private async sessionFresh(s: SessionRecord & { account: AccountRecord }, now: number) {
    const operator = s.account.operator,
      max = (operator ? limits.operator_max_seconds : limits.user_max_seconds) * 1000,
      idle = (operator ? limits.operator_idle_seconds : limits.user_idle_seconds) * 1000;
    if (now - +s.createdAt >= max || now - +s.lastSeen >= idle) {
      await this.repo.updateSession(s.id, { revokedAt: new Date() });
      fail(401, 'SESION_VENCIDA', 'La sesión venció', 'Inicia sesión de nuevo');
    }
  }
  private sessionCsrf(
    req: SessionCredentials,
    s: SessionRecord,
    mutating: boolean,
    bearer: boolean,
  ) {
    if (mutating && !bearer) {
      if (
        req.origin !== config().APP_ORIGIN ||
        typeof req.csrfToken !== 'string' ||
        !equalHash(req.csrfToken, s.csrfHash)
      )
        fail(403, 'CSRF', 'Vuelve a abrir tu cuenta para continuar');
    }
  }
  private async providerSession(s: SessionRecord) {
    let t = this.secrets.decrypt(s.providerTokens);
    if (t.expires_at * 1000 < Date.now() + 30000) {
      const lease = await this.repo.claimRefresh(s.id, new Date(), seconds(15));
      if (lease.count) {
        t = await this.renewProviderSession(s, t);
      } else {
        t = await this.awaitProviderSession(s.id);
      }
    }
    return t;
  }
  private async renewProviderSession(s: SessionRecord, previous: AccountTokens) {
    try {
      const { data, error } = await this.identity.refresh(previous.refresh_token);
      if (error || !data.session) fail(401, 'SESION', 'Inicia sesión de nuevo');
      const current = data.session;
      await this.repo.storeTokensIfActive(s.id, this.secrets.encrypt(current));
      return current;
    } finally {
      await this.repo.updateSession(s.id, { refreshLease: null });
    }
  }
  private async awaitProviderSession(id: string) {
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const fresh = await this.repo.requiredSession(id);
      if (!fresh.refreshLease) return this.secrets.decrypt(fresh.providerTokens);
    }
    fail(503, 'SESION_OCUPADA', 'La sesión se está renovando', 'Intenta de nuevo');
  }
  recent(p: AccountPrincipal) {
    if (Date.now() - +p.session.authenticatedAt > limits.reauth_seconds * 1000)
      fail(
        403,
        'REAUTENTICAR',
        'Verifica tu correo otra vez para continuar',
        'Inicia una nueva sesión con código',
      );
  }
  async logout(p: AccountPrincipal, all = false) {
    if (all) this.recent(p);
    await this.repo.transaction(async (tx) => {
      await tx.revokeSessions(all ? { accountId: p.account.id } : { id: p.session.id }, new Date());
      await tx.audit({
        accountId: p.account.id,
        action: all ? 'session.revoked_all' : 'session.revoked',
        resourceId: p.session.id,
      });
    });
    return { estado: 'sesion_revocada' };
  }
  async csrf(p: AccountPrincipal) {
    const value = secret();
    await this.repo.updateSession(p.session.id, { csrfHash: digest(value) });
    return { csrf_token: value };
  }
}
