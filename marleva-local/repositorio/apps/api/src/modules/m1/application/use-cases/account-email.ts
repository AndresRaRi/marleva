import type { EmailAccountRepository, EmailIdentity } from '../ports/email-account.js';
import type { AccountSecrets } from '../ports/account-secrets.js';
import type { RecentSession } from '../ports/recent-session.js';
import { limits } from '../../../../config.js';
import { fail, email, uuid, code } from '../../../../security.js';
import { randomUUID } from 'node:crypto';

import { type AccountPrincipal } from '../../domain/account-records.js';
const seconds = (n: number) => new Date(Date.now() + n * 1000);
export class AccountEmail {
  constructor(
    private readonly repo: EmailAccountRepository,
    private readonly identity: EmailIdentity,
    private readonly secrets: AccountSecrets,
    private readonly sessions: RecentSession,
  ) {}
  async emailChange(p: AccountPrincipal, newAddress: unknown) {
    this.sessions.recent(p);
    const next = email(newAddress);
    if (next === p.account.email) fail(422, 'CORREO_IGUAL', 'Escribe un correo diferente');
    const conflict = await this.repo.accountForEmail(next);
    if (conflict) fail(409, 'CAMBIO_NO_DISPONIBLE', 'No se puede usar ese correo');
    const id = randomUUID();
    await this.repo.transaction(async (tx) => {
      await tx.lockKey(p.account.id);
      const active = await tx.activeEmailChange(p.account.id, new Date());
      if (active) fail(409, 'CAMBIO_EN_CURSO', 'Ya hay un cambio de correo en curso');
      await tx.createEmailChange({
        id,
        accountId: p.account.id,
        oldEmail: p.account.email,
        newEmail: next,
        providerTokens: this.secrets.encrypt(p.tokens),
        expiresAt: seconds(limits.otp_seconds),
      });
    });
    const { client, tokens: t } = await this.identity.authenticated(p.tokens);
    const { error } = await client.updateEmail(next);
    if (error) {
      await this.repo.updateEmailChange(id, { state: 'failed' });
      fail(503, 'CAMBIO_NO_DISPONIBLE', 'No pudimos iniciar el cambio de correo');
    }
    await this.repo.updateEmailChange(id, {
      state: 'open',
      providerTokens: this.secrets.encrypt(t),
    });
    return { id, estado: 'verificar_ambos_buzones' };
  }
  async confirmEmail(p: AccountPrincipal, changeId: unknown, address: unknown, otp: unknown) {
    const id = uuid(changeId),
      mail = email(address),
      value = code(otp);
    const claim = await this.repo.transaction(async (tx) => {
      await tx.lockKey(id);
      const c = await tx.emailChange(id);
      if (!c || c.accountId !== p.account.id) fail(404, 'NO_EXISTE', 'No se encontró el cambio');
      if (c.state !== 'open' || c.expiresAt < new Date() || c.attempts >= limits.max_attempts)
        fail(409, 'CAMBIO_NO_VIGENTE', 'El cambio ya no está disponible');
      if (![c.oldEmail, c.newEmail].includes(mail))
        fail(422, 'BUZON', 'Verifica uno de los dos buzones');
      if ([c.oldConfirmed && c.oldEmail, c.newConfirmed && c.newEmail].includes(mail))
        fail(409, 'YA_CONFIRMADO', 'Ese buzón ya se verificó');
      return tx.claimEmailChange(id);
    });
    // Verify the code against the mailbox that actually received it. The local
    // provider requires the original address for the original mailbox's code.
    const { error } = await this.identity.verifyCode(mail, value, 'email_change');
    if (error) {
      await this.repo.updateEmailChange(id, { state: 'open' });
      fail(401, 'CODIGO_NO_VALIDO', 'El código no es válido o venció');
    }
    const oldConfirmed = claim.oldConfirmed || mail === claim.oldEmail,
      newConfirmed = claim.newConfirmed || mail === claim.newEmail;
    if (!oldConfirmed || !newConfirmed) {
      await this.repo.updateEmailChange(id, { state: 'open', oldConfirmed, newConfirmed });
      return { estado: 'falta_otro_buzon' };
    }
    const check = await this.identity.adminUser(p.account.authId);
    if (check.error || check.data.user?.email !== claim.newEmail) {
      await this.repo.updateEmailChange(id, { state: 'reconcile', oldConfirmed, newConfirmed });
      fail(
        503,
        'CAMBIO_VERIFICANDO',
        'Estamos comprobando el cambio',
        'Consulta tu cuenta y solicita ayuda si persiste',
      );
    }
    await this.finishEmailChange(id, p.account.id, claim.oldEmail, claim.newEmail);
    return { estado: 'completo', mensaje: 'Correo actualizado. Inicia sesión con el nuevo correo' };
  }
  async finishEmailChange(id: string, accountId: string, oldEmail: string, newEmail: string) {
    await this.repo.transaction(async (tx) => {
      await tx.lockKey(accountId);
      const c = await tx.requiredEmailChange(id);
      if (c.state === 'complete') return;
      await tx.setAccountEmail(accountId, newEmail);
      await tx.revokeSessions({ accountId }, new Date());
      await tx.updateEmailChange(id, { state: 'complete', oldConfirmed: true, newConfirmed: true });
      await tx.notice({
        accountId,
        kind: 'email.changed',
        text: 'Correo actualizado. Se cerraron las sesiones anteriores.',
      });
      for (const [i, recipient] of [oldEmail, newEmail].entries())
        await tx.outbox({
          reference: `email.changed:${id}:${i}`,
          recipient,
          subject: 'Correo actualizado en Marleva local',
          text: 'Tu correo cambió y tus sesiones anteriores se cerraron. Solo entorno de pruebas con datos ficticios.',
        });
      await tx.audit({ accountId, action: 'email.changed', resourceId: id });
    });
  }
  async reconcile() {
    for (const c of await this.repo.emailReconciliations()) {
      const u = await this.identity.adminUser(
        (await this.repo.requiredAccount(c.accountId)).authId,
      );
      if (!u.error && u.data.user?.email === c.newEmail)
        await this.finishEmailChange(c.id, c.accountId, c.oldEmail, c.newEmail);
    }
  }
}
