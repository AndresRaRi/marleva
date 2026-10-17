import type { AccessAccountRepository, AccessIdentity } from '../ports/access-account.js';
import type { AccountSecrets } from '../ports/account-secrets.js';
import { limits } from '../../../../config.js';
import { digest, secret, fail, email, uuid, code } from '../../../../security.js';
import { randomUUID } from 'node:crypto';
import { RateLimitException } from '../../../../rate-limit.exception.js';
import { originWait } from '../../domain/otp-origin-limit.js';
import { publicAccount } from '../../domain/account-records.js';
const seconds = (n: number) => new Date(Date.now() + n * 1000);
export class AccessAccounts {
  constructor(
    private readonly repo: AccessAccountRepository,
    private readonly identity: AccessIdentity,
    private readonly secrets: AccountSecrets,
  ) {}
  async challenge(input: unknown, origin: string) {
    const address = email(input),
      id = randomUUID();
    const result = await this.repo.transaction(async (tx) => {
      await tx.lockOrigin(origin);
      await tx.lockKey(address);
      const now = new Date();
      const recent = await tx.latestChallenge(address);
      if (recent?.blockedUntil && recent.blockedUntil > now)
        return { blocked: Math.ceil((+recent.blockedUntil - +now) / 1000) };
      if (recent && +now - +recent.createdAt < limits.resend_seconds * 1000)
        return { blocked: limits.resend_seconds - Math.floor((+now - +recent.createdAt) / 1000) };
      const recentOrigin = await tx.recentOrigin(origin, new Date(+now - 3600000));
      const remaining = originWait(
        recentOrigin.map((item) => item.createdAt),
        now,
      );
      if (remaining) return { blocked: remaining };
      await tx.supersedeChallenges(address);
      await tx.createChallenge({
        id,
        email: address,
        origin,
        expiresAt: seconds(limits.otp_seconds),
      });
      return { blocked: 0 };
    });
    if (result.blocked) throw new RateLimitException(result.blocked);
    const { error } = await this.identity.sendCode(address);
    if (error) {
      await this.repo.updateChallenge(id, { state: 'failed' });
      fail(
        503,
        'CORREO_NO_DISPONIBLE',
        'No pudimos enviar el código',
        'Espera y solicita otro código',
      );
    }
    await this.repo.openSentChallenge(id);
    return {
      challenge_id: id,
      espera_segundos: limits.resend_seconds,
      mensaje: 'Si el correo es válido, recibirás un código',
    };
  }
  async verify(challengeId: unknown, otp: unknown) {
    const id = uuid(challengeId),
      value = code(otp),
      now = new Date();
    const claim = await this.repo.transaction(async (tx) => {
      const c = await tx.challenge(id);
      if (!c) return null;
      await tx.lockKey(c.email);
      const current = await tx.requiredChallenge(id);
      if (
        current.state !== 'open' ||
        current.expiresAt <= now ||
        current.attempts >= limits.max_attempts ||
        (current.blockedUntil && current.blockedUntil > now)
      )
        return null;
      return tx.claimChallenge(id);
    });
    if (!claim)
      fail(
        401,
        'CODIGO_NO_VALIDO',
        'El código no es válido o ya no está disponible',
        'Solicita otro código cuando termine la espera',
      );
    const { data, error } = await this.identity.verifyCode(claim.email, value, 'email');
    if (error || !data.session || !data.user) {
      await this.repo.updateChallenge(id, {
        state: claim.attempts >= limits.max_attempts ? 'blocked' : 'open',
        blockedUntil: claim.attempts >= limits.max_attempts ? seconds(limits.pause_seconds) : null,
      });
      fail(
        401,
        'CODIGO_NO_VALIDO',
        'El código no es válido o venció',
        'Comprueba el código o solicita otro',
      );
    }
    const token = secret(),
      csrf = secret();
    const result = await this.repo.transaction(async (tx) => {
      // A resend may supersede this challenge while provider verification is in flight.
      await tx.lockKey(claim.email);
      const latest = await tx.latestChallenge(claim.email);
      if (latest?.id !== id) {
        await tx.updateChallenge(id, { state: 'superseded' });
        return null;
      }
      const a = await tx.accountForAuth(data.user!.id, claim.email);
      if (a.state !== 'active') return null;
      const session = await tx.createSession({
        accountId: a.id,
        tokenHash: digest(token),
        csrfHash: digest(csrf),
        providerTokens: this.secrets.encrypt(data.session!),
      });
      await tx.updateChallenge(id, { state: 'consumed' });
      await tx.audit({ accountId: a.id, action: 'session.created', resourceId: session.id });
      return { a, session };
    });
    if (!result) fail(401, 'CODIGO_NO_VALIDO', 'Solicita un código nuevo');
    return { token, csrf, account: publicAccount(result.a) };
  }
}
