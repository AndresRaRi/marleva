import { RateLimitException } from './rate-limit.exception.js';
import { originWait } from './modules/m1/domain/otp-origin-limit.js';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Database } from './database.js';
import { config, limits } from './config.js';
import { identity, identityAdmin, authenticatedIdentity, tokens, type Tokens } from './identity.js';
import { digest, secret, seal, unseal, equalHash, fail, email, uuid, code } from './security.js';
import type { Request } from 'express';
import type { Session, Account } from './generated/prisma/client.js';
export type Principal = { session: Session; account: Account; tokens: Tokens };
const seconds = (n: number) => new Date(Date.now() + n * 1000);
@Injectable()
export class AccountService {
  constructor(private readonly db: Database) {}
  private encrypt(t: Tokens) {
    return seal(t, config().TOKEN_ENCRYPTION_KEY);
  }
  private decrypt(t: string) {
    return unseal<Tokens>(t, config().TOKEN_ENCRYPTION_KEY);
  }
  async challenge(input: unknown, origin: string) {
    const address = email(input),
      id = randomUUID();
    const result = await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${origin}, 1101))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${address}))`;
      const now = new Date();
      const recent = await tx.challenge.findFirst({
        where: { email: address },
        orderBy: { createdAt: 'desc' },
      });
      if (recent?.blockedUntil && recent.blockedUntil > now)
        return { blocked: Math.ceil((+recent.blockedUntil - +now) / 1000) };
      if (recent && +now - +recent.createdAt < limits.resend_seconds * 1000)
        return { blocked: limits.resend_seconds - Math.floor((+now - +recent.createdAt) / 1000) };
      const recentOrigin = await tx.challenge.findMany({
        where: { origin, createdAt: { gt: new Date(+now - 3600000) } },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      const remaining = originWait(
        recentOrigin.map((item) => item.createdAt),
        now,
      );
      if (remaining) return { blocked: remaining };
      await tx.challenge.updateMany({
        where: { email: address, state: { in: ['open', 'sending'] } },
        data: { state: 'superseded' },
      });
      await tx.challenge.create({
        data: { id, email: address, origin, expiresAt: seconds(limits.otp_seconds) },
      });
      return { blocked: 0 };
    });
    if (result.blocked) throw new RateLimitException(result.blocked);
    const { error } = await identity().auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: true },
    });
    if (error) {
      await this.db.challenge.update({ where: { id }, data: { state: 'failed' } });
      fail(
        503,
        'CORREO_NO_DISPONIBLE',
        'No pudimos enviar el código',
        'Espera y solicita otro código',
      );
    }
    await this.db.challenge.updateMany({
      where: { id, state: 'sending' },
      data: { state: 'open' },
    });
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
    const claim = await this.db.$transaction(async (tx) => {
      const c = await tx.challenge.findUnique({ where: { id } });
      if (!c) return null;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${c.email}))`;
      const current = await tx.challenge.findUniqueOrThrow({ where: { id } });
      if (
        current.state !== 'open' ||
        current.expiresAt <= now ||
        current.attempts >= limits.max_attempts ||
        (current.blockedUntil && current.blockedUntil > now)
      )
        return null;
      return tx.challenge.update({
        where: { id },
        data: { state: 'verifying', attempts: { increment: 1 } },
      });
    });
    if (!claim)
      fail(
        401,
        'CODIGO_NO_VALIDO',
        'El código no es válido o ya no está disponible',
        'Solicita otro código cuando termine la espera',
      );
    const { data, error } = await identity().auth.verifyOtp({
      email: claim.email,
      token: value,
      type: 'email',
    });
    if (error || !data.session || !data.user) {
      await this.db.challenge.update({
        where: { id },
        data: {
          state: claim.attempts >= limits.max_attempts ? 'blocked' : 'open',
          blockedUntil:
            claim.attempts >= limits.max_attempts ? seconds(limits.pause_seconds) : null,
        },
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
    const result = await this.db.$transaction(async (tx) => {
      // A resend may supersede this challenge while provider verification is in flight.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${claim.email}))`;
      const latest = await tx.challenge.findFirst({
        where: { email: claim.email },
        orderBy: { createdAt: 'desc' },
      });
      if (latest?.id !== id) {
        await tx.challenge.update({ where: { id }, data: { state: 'superseded' } });
        return null;
      }
      const a = await tx.account.upsert({
        where: { authId: data.user!.id },
        create: { authId: data.user!.id, email: claim.email },
        update: {},
      });
      if (a.state !== 'active') return null;
      const session = await tx.session.create({
        data: {
          accountId: a.id,
          tokenHash: digest(token),
          csrfHash: digest(csrf),
          providerTokens: this.encrypt(tokens(data.session!)),
        },
      });
      await tx.challenge.update({ where: { id }, data: { state: 'consumed' } });
      await tx.audit.create({
        data: { accountId: a.id, action: 'session.created', resourceId: session.id },
      });
      return { a, session };
    });
    if (!result) fail(401, 'CODIGO_NO_VALIDO', 'Solicita un código nuevo');
    return { token, csrf, account: this.publicAccount(result.a) };
  }
  publicAccount(a: Account) {
    return {
      id: a.id,
      correo: a.email,
      estado: a.state,
      pertenencia: 'no_solicitada',
      operador: a.operator,
      acciones_permitidas: ['cuenta', 'salir', 'cambiar_correo'],
    };
  }
  async principal(req: Request, mutating = false): Promise<Principal> {
    const bearer = req.headers.authorization;
    // Browser credentials always use cookies and exact origin checks.
    if (bearer && req.headers.origin) fail(403, 'ORIGEN', 'Acceso no permitido');
    const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : req.cookies?.marleva_session;
    if (typeof token !== 'string' || token.length > 200)
      fail(401, 'SESION', 'Inicia sesión para continuar');
    const s = await this.db.session.findUnique({
      where: { tokenHash: digest(token) },
      include: { account: true },
    });
    const now = Date.now();
    if (!s || s.revokedAt || s.account.state !== 'active')
      fail(401, 'SESION', 'La sesión terminó', 'Inicia sesión de nuevo');
    const operator = s.account.operator,
      max = (operator ? limits.operator_max_seconds : limits.user_max_seconds) * 1000,
      idle = (operator ? limits.operator_idle_seconds : limits.user_idle_seconds) * 1000;
    if (now - +s.createdAt >= max || now - +s.lastSeen >= idle) {
      await this.db.session.update({ where: { id: s.id }, data: { revokedAt: new Date() } });
      fail(401, 'SESION_VENCIDA', 'La sesión venció', 'Inicia sesión de nuevo');
    }
    if (mutating && !bearer) {
      if (
        req.headers.origin !== config().APP_ORIGIN ||
        typeof req.headers['x-csrf-token'] !== 'string' ||
        !equalHash(req.headers['x-csrf-token'], s.csrfHash)
      )
        fail(403, 'CSRF', 'Vuelve a abrir tu cuenta para continuar');
    }
    let t = this.decrypt(s.providerTokens);
    if (t.expires_at * 1000 < Date.now() + 30000) {
      const lease = await this.db.session.updateMany({
        where: {
          id: s.id,
          revokedAt: null,
          OR: [{ refreshLease: null }, { refreshLease: { lt: new Date() } }],
        },
        data: { refreshLease: seconds(15) },
      });
      if (lease.count) {
        try {
          const { data, error } = await identity().auth.refreshSession({
            refresh_token: t.refresh_token,
          });
          if (error || !data.session) fail(401, 'SESION', 'Inicia sesión de nuevo');
          t = tokens(data.session);
          await this.db.session.updateMany({
            where: { id: s.id, revokedAt: null },
            data: { providerTokens: this.encrypt(t) },
          });
        } finally {
          await this.db.session.update({ where: { id: s.id }, data: { refreshLease: null } });
        }
      } else {
        let done = false;
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 100));
          const fresh = await this.db.session.findUniqueOrThrow({ where: { id: s.id } });
          if (!fresh.refreshLease) {
            t = this.decrypt(fresh.providerTokens);
            done = true;
            break;
          }
        }
        if (!done) fail(503, 'SESION_OCUPADA', 'La sesión se está renovando', 'Intenta de nuevo');
      }
    }
    const { data, error } = await identity().auth.getUser(t.access_token);
    if (error || data.user?.id !== s.account.authId) fail(401, 'SESION', 'Inicia sesión de nuevo');
    const still = await this.db.session.updateMany({
      where: { id: s.id, revokedAt: null },
      data: { lastSeen: new Date() },
    });
    if (!still.count) fail(401, 'SESION', 'La sesión terminó');
    const current = await this.db.account.findUniqueOrThrow({ where: { id: s.accountId } });
    if (current.state !== 'active') fail(403, 'CUENTA', 'Tu cuenta no está habilitada');
    return { session: s, account: current, tokens: t };
  }
  recent(p: Principal) {
    if (Date.now() - +p.session.authenticatedAt > limits.reauth_seconds * 1000)
      fail(
        403,
        'REAUTENTICAR',
        'Verifica tu correo otra vez para continuar',
        'Inicia una nueva sesión con código',
      );
  }
  async logout(p: Principal, all = false) {
    if (all) this.recent(p);
    await this.db.$transaction(async (tx) => {
      await tx.session.updateMany({
        where: all ? { accountId: p.account.id } : { id: p.session.id },
        data: { revokedAt: new Date() },
      });
      await tx.audit.create({
        data: {
          accountId: p.account.id,
          action: all ? 'session.revoked_all' : 'session.revoked',
          resourceId: p.session.id,
        },
      });
    });
    return { estado: 'sesion_revocada' };
  }
  async emailChange(p: Principal, newAddress: unknown) {
    this.recent(p);
    const next = email(newAddress);
    if (next === p.account.email) fail(422, 'CORREO_IGUAL', 'Escribe un correo diferente');
    const conflict = await this.db.account.findUnique({ where: { email: next } });
    if (conflict) fail(409, 'CAMBIO_NO_DISPONIBLE', 'No se puede usar ese correo');
    const id = randomUUID();
    await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${p.account.id}))`;
      const active = await tx.emailChange.findFirst({
        where: {
          accountId: p.account.id,
          state: { in: ['open', 'sending', 'verifying'] },
          expiresAt: { gt: new Date() },
        },
      });
      if (active) fail(409, 'CAMBIO_EN_CURSO', 'Ya hay un cambio de correo en curso');
      await tx.emailChange.create({
        data: {
          id,
          accountId: p.account.id,
          oldEmail: p.account.email,
          newEmail: next,
          providerTokens: this.encrypt(p.tokens),
          expiresAt: seconds(limits.otp_seconds),
        },
      });
    });
    const { client, tokens: t } = await authenticatedIdentity(p.tokens);
    const { error } = await client.auth.updateUser({ email: next });
    if (error) {
      await this.db.emailChange.update({ where: { id }, data: { state: 'failed' } });
      fail(503, 'CAMBIO_NO_DISPONIBLE', 'No pudimos iniciar el cambio de correo');
    }
    await this.db.emailChange.update({
      where: { id },
      data: { state: 'open', providerTokens: this.encrypt(t) },
    });
    return { id, estado: 'verificar_ambos_buzones' };
  }
  async confirmEmail(p: Principal, changeId: unknown, address: unknown, otp: unknown) {
    const id = uuid(changeId),
      mail = email(address),
      value = code(otp);
    const claim = await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
      const c = await tx.emailChange.findUnique({ where: { id } });
      if (!c || c.accountId !== p.account.id) fail(404, 'NO_EXISTE', 'No se encontró el cambio');
      if (c.state !== 'open' || c.expiresAt < new Date() || c.attempts >= limits.max_attempts)
        fail(409, 'CAMBIO_NO_VIGENTE', 'El cambio ya no está disponible');
      if (![c.oldEmail, c.newEmail].includes(mail))
        fail(422, 'BUZON', 'Verifica uno de los dos buzones');
      if ((mail === c.oldEmail && c.oldConfirmed) || (mail === c.newEmail && c.newConfirmed))
        fail(409, 'YA_CONFIRMADO', 'Ese buzón ya se verificó');
      return tx.emailChange.update({
        where: { id },
        data: { state: 'verifying', attempts: { increment: 1 } },
      });
    });
    // Verify the code against the mailbox that actually received it. The local
    // provider requires the original address for the original mailbox's code.
    const { error } = await identity().auth.verifyOtp({
      email: mail,
      token: value,
      type: 'email_change',
    });
    if (error) {
      await this.db.emailChange.update({ where: { id }, data: { state: 'open' } });
      fail(401, 'CODIGO_NO_VALIDO', 'El código no es válido o venció');
    }
    const oldConfirmed = claim.oldConfirmed || mail === claim.oldEmail,
      newConfirmed = claim.newConfirmed || mail === claim.newEmail;
    if (!oldConfirmed || !newConfirmed) {
      await this.db.emailChange.update({
        where: { id },
        data: { state: 'open', oldConfirmed, newConfirmed },
      });
      return { estado: 'falta_otro_buzon' };
    }
    const check = await identityAdmin().auth.admin.getUserById(p.account.authId);
    if (check.error || check.data.user.email !== claim.newEmail) {
      await this.db.emailChange.update({
        where: { id },
        data: { state: 'reconcile', oldConfirmed, newConfirmed },
      });
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
    await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${accountId}))`;
      const c = await tx.emailChange.findUniqueOrThrow({ where: { id } });
      if (c.state === 'complete') return;
      await tx.account.update({ where: { id: accountId }, data: { email: newEmail } });
      await tx.session.updateMany({ where: { accountId }, data: { revokedAt: new Date() } });
      await tx.emailChange.update({
        where: { id },
        data: { state: 'complete', oldConfirmed: true, newConfirmed: true },
      });
      await tx.notice.create({
        data: {
          accountId,
          kind: 'email.changed',
          text: 'Correo actualizado. Se cerraron las sesiones anteriores.',
        },
      });
      for (const [i, recipient] of [oldEmail, newEmail].entries())
        await tx.outbox.create({
          data: {
            reference: `email.changed:${id}:${i}`,
            recipient,
            subject: 'Correo actualizado en Marleva local',
            text: 'Tu correo cambió y tus sesiones anteriores se cerraron. Solo entorno de pruebas con datos ficticios.',
          },
        });
      await tx.audit.create({ data: { accountId, action: 'email.changed', resourceId: id } });
    });
  }
  async csrf(p: Principal) {
    const value = secret();
    await this.db.session.update({
      where: { id: p.session.id },
      data: { csrfHash: digest(value) },
    });
    return { csrf_token: value };
  }
  async enroll(p: Principal) {
    if (!p.account.operator) fail(403, 'PERMISO', 'No tienes permiso de operador');
    this.recent(p);
    const { client } = await authenticatedIdentity(p.tokens);
    const { data, error } = await client.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Marleva local',
    });
    if (error || !data) fail(409, 'FACTOR', 'No pudimos preparar el factor');
    await this.db.audit.create({ data: { accountId: p.account.id, action: 'factor.enrolled' } });
    return { id: data.id, totp: data.totp };
  }
  async verifyFactor(p: Principal, factorId: unknown, otp: unknown) {
    if (!p.account.operator) fail(403, 'PERMISO', 'No tienes permiso');
    this.recent(p);
    const { client } = await authenticatedIdentity(p.tokens);
    const { data, error } = await client.auth.mfa.challengeAndVerify({
      factorId: uuid(factorId),
      code: code(otp),
    });
    if (error || !data) fail(401, 'FACTOR', 'Código de factor no válido');
    await this.db.session.update({
      where: { id: p.session.id },
      data: { providerTokens: this.encrypt(tokens(data)) },
    });
    await this.db.audit.create({ data: { accountId: p.account.id, action: 'factor.verified' } });
    return { estado: 'factor_verificado' };
  }
  async operator(p: Principal) {
    if (!p.account.operator) fail(403, 'PERMISO', 'No tienes permiso de operador');
    this.recent(p);
    const { client } = await authenticatedIdentity(p.tokens);
    const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || data?.currentLevel !== 'aal2') fail(403, 'MFA', 'Verifica tu segundo factor');
    return { estado: 'operador_autenticado' };
  }
  async reconcile() {
    for (const c of await this.db.emailChange.findMany({
      where: {
        state: { in: ['reconcile', 'verifying', 'open'] },
        newConfirmed: true,
        oldConfirmed: true,
      },
      take: 10,
    })) {
      const u = await identityAdmin().auth.admin.getUserById(
        (await this.db.account.findUniqueOrThrow({ where: { id: c.accountId } })).authId,
      );
      if (!u.error && u.data.user.email === c.newEmail)
        await this.finishEmailChange(c.id, c.accountId, c.oldEmail, c.newEmail);
    }
  }
}
