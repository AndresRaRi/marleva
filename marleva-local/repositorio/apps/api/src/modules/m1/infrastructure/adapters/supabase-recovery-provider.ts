import { identityAdmin, identity, authenticatedIdentity } from '../../../../identity.js';
import { fail } from '../../../../security.js';
import type { RecoveryProvider } from '../../application/ports/recovery-provider.js';
import type { RecoveryTokens } from '../../domain/entities/mfa-recovery.js';
export class SupabaseRecoveryProvider implements RecoveryProvider {
  async assurance(tokens: RecoveryTokens) {
    const { client } = await authenticatedIdentity(tokens);
    const result = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (result.error || !result.data)
      fail(503, 'DEPENDENCIA', 'No pudimos comprobar el segundo factor');
    return result.data.currentLevel === 'aal2' ? 'aal2' : 'aal1';
  }
  private async list(authId: string) {
    const result = await identityAdmin().auth.admin.mfa.listFactors({ userId: authId });
    if (result.error || !result.data) fail(503, 'DEPENDENCIA', 'No pudimos consultar los factores');
    return result.data.factors;
  }
  async factors(authId: string) {
    return (await this.list(authId))
      .filter((f) => f.status === 'verified' && f.factor_type === 'totp')
      .map((f) => f.id);
  }
  async reset(authId: string, ids: string[], tokens: RecoveryTokens) {
    const client = identity();
    const fresh = await client.auth.setSession(tokens);
    if (fresh.error || !fresh.data.session || fresh.data.user?.id !== authId)
      fail(503, 'DEPENDENCIA', 'La revocación requiere conciliación');
    const logout = await identityAdmin().auth.admin.signOut(
      fresh.data.session.access_token,
      'global',
    );
    if (logout.error) fail(503, 'DEPENDENCIA', 'No pudimos revocar los accesos anteriores');
    for (const factor of await this.list(authId)) {
      if (!ids.includes(factor.id)) continue;
      const removed = await identityAdmin().auth.admin.mfa.deleteFactor({
        userId: authId,
        id: factor.id,
      });
      if (removed.error) fail(503, 'DEPENDENCIA', 'El factor sigue pendiente de recuperación');
    }
    if ((await this.list(authId)).some((f) => ids.includes(f.id)))
      fail(503, 'DEPENDENCIA', 'No se confirmó la revocación');
  }
  async enroll(authId: string, recoveryId: string, tokens: RecoveryTokens) {
    const name = 'recovery-' + recoveryId;
    for (const factor of await this.list(authId)) {
      if (factor.friendly_name !== name) continue;
      if (factor.status === 'verified')
        fail(409, 'FACTOR', 'Consulta la recuperación antes de repetir');
      const removed = await identityAdmin().auth.admin.mfa.deleteFactor({
        userId: authId,
        id: factor.id,
      });
      if (removed.error) fail(503, 'DEPENDENCIA', 'No pudimos conciliar el factor pendiente');
    }
    const { client } = await authenticatedIdentity(tokens);
    const result = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: name });
    if (result.error || !result.data)
      fail(503, 'DEPENDENCIA', 'No pudimos preparar tu nuevo factor');
    return {
      factor_id: result.data.id,
      uri: result.data.totp.uri,
      qr_code: result.data.totp.qr_code,
    };
  }
  async verified(authId: string, factorId: string) {
    return (await this.list(authId)).some((f) => f.id === factorId && f.status === 'verified');
  }
  async verify(
    authId: string,
    factorId: string,
    code: string,
    tokens: RecoveryTokens,
    replaying = false,
  ) {
    const { client } = await authenticatedIdentity(tokens);
    if (replaying && (await this.replayedVerification(authId, factorId, tokens))) return;
    const result = await client.auth.mfa.challengeAndVerify({ factorId, code });
    if (result.error || !result.data) fail(401, 'FACTOR', 'Revisa el código de tu autenticador');
    const level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (level.error || level.data?.currentLevel !== 'aal2')
      fail(503, 'DEPENDENCIA', 'No pudimos confirmar tu segundo factor');
  }
  private async replayedVerification(authId: string, factorId: string, tokens: RecoveryTokens) {
    if (!(await this.verified(authId, factorId))) return false;
    const { client } = await authenticatedIdentity(tokens);
    const refreshed = await client.auth.refreshSession(tokens);
    if (refreshed.error || refreshed.data.user?.id !== authId) return false;
    const current = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    return !current.error && current.data?.currentLevel === 'aal2';
  }
}
