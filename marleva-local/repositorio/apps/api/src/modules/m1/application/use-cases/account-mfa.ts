import type { OperatorAccountRepository, OperatorIdentity } from '../ports/operator-account.js';
import type { AccountSecrets } from '../ports/account-secrets.js';
import type { RecentSession } from '../ports/recent-session.js';

import { fail, uuid, code } from '../../../../security.js';

import { type AccountPrincipal } from '../../domain/account-records.js';
export class AccountMfa {
  constructor(
    private readonly repo: OperatorAccountRepository,
    private readonly identity: OperatorIdentity,
    private readonly secrets: AccountSecrets,
    private readonly sessions: RecentSession,
  ) {}
  private async noActiveRecovery(accountId: string) {
    const active = await this.repo.activeRecovery(accountId, new Date());
    const latest = await this.repo.latestApprovedRecovery(accountId);
    if (active || (latest && latest.state !== 'completed'))
      fail(409, 'RECUPERACION_ACTIVA', 'Continúa el proceso de recuperación');
  }
  async factors(p: AccountPrincipal) {
    if (!p.account.operator) fail(403, 'PERMISO', 'No tienes permiso de operador');
    const { client } = await this.identity.authenticated(p.tokens);
    const { data, error } = await client.factors();
    if (error || !data || data.all.length > 50)
      fail(503, 'DEPENDENCIA', 'No pudimos consultar tus factores');
    return {
      items: data.all
        .filter((factor) => factor.factor_type === 'totp')
        .map((factor) => ({
          id: factor.id,
          nombre: factor.friendly_name ?? 'Autenticador',
          estado: factor.status,
        })),
    };
  }
  async enroll(p: AccountPrincipal) {
    if (!p.account.operator) fail(403, 'PERMISO', 'No tienes permiso de operador');
    this.sessions.recent(p);
    await this.noActiveRecovery(p.account.id);
    const { client } = await this.identity.authenticated(p.tokens);
    const factors = await client.factors();
    if (factors.error || !factors.data)
      fail(503, 'DEPENDENCIA', 'No pudimos consultar tus factores');
    if (factors.data.totp.some((factor) => factor.status === 'verified')) {
      const assurance = await client.assurance();
      if (assurance.error || assurance.data?.currentLevel !== 'aal2')
        fail(403, 'MFA', 'Verifica tu segundo factor antes de agregar otro');
    }
    const { data, error } = await client.enroll();
    if (error || !data) fail(409, 'FACTOR', 'No pudimos preparar el factor');
    await this.repo.audit({ accountId: p.account.id, action: 'factor.enrolled' });
    return { id: data.id, totp: data.totp };
  }
  async verifyFactor(p: AccountPrincipal, factorId: unknown, otp: unknown) {
    if (!p.account.operator) fail(403, 'PERMISO', 'No tienes permiso');
    this.sessions.recent(p);
    const { client } = await this.identity.authenticated(p.tokens);
    await this.noActiveRecovery(p.account.id);
    const { data, error } = await client.verify(uuid(factorId), code(otp));
    if (error || !data) fail(401, 'FACTOR', 'Código de factor no válido');
    await this.repo.updateSession(p.session.id, { providerTokens: this.secrets.encrypt(data) });
    await this.repo.audit({ accountId: p.account.id, action: 'factor.verified' });
    return { estado: 'factor_verificado' };
  }
  async operator(p: AccountPrincipal) {
    await this.noActiveRecovery(p.account.id);
    if (!p.account.operator) fail(403, 'PERMISO', 'No tienes permiso de operador');
    this.sessions.recent(p);
    const { client } = await this.identity.authenticated(p.tokens);
    const { data, error } = await client.assurance();
    if (error || data?.currentLevel !== 'aal2') fail(403, 'MFA', 'Verifica tu segundo factor');
    return { estado: 'operador_autenticado' };
  }
}
