import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { Database } from './database.js';
import {
  publicAccount,
  type AccountRecord,
  type AccountPrincipal,
} from './modules/m1/domain/account-records.js';
import { PrismaAccountRepository } from './modules/m1/infrastructure/repositories/prisma-account-repository.js';
import { SupabaseAccountIdentity } from './modules/m1/infrastructure/adapters/supabase-account-identity.js';
import { LocalAccountSecrets } from './modules/m1/infrastructure/adapters/local-account-secrets.js';
import { AccessAccounts } from './modules/m1/application/use-cases/access-accounts.js';
import { AccountSessions } from './modules/m1/application/use-cases/account-sessions.js';
import { AccountEmail } from './modules/m1/application/use-cases/account-email.js';
import { AccountMfa } from './modules/m1/application/use-cases/account-mfa.js';
export type Principal = AccountPrincipal;
@Injectable()
export class AccountService {
  private readonly access: AccessAccounts;
  private readonly sessions: AccountSessions;
  private readonly emailChanges: AccountEmail;
  private readonly mfa: AccountMfa;
  constructor(private readonly db: Database) {
    const repo = new PrismaAccountRepository(db),
      identity = new SupabaseAccountIdentity(),
      secrets = new LocalAccountSecrets();
    this.access = new AccessAccounts(repo, identity, secrets);
    this.sessions = new AccountSessions(repo, identity, secrets);
    this.emailChanges = new AccountEmail(repo, identity, secrets, this.sessions);
    this.mfa = new AccountMfa(repo, identity, secrets, this.sessions);
  }
  challenge(input: unknown, origin: string) {
    return this.access.challenge(input, origin);
  }
  verify(challengeId: unknown, otp: unknown) {
    return this.access.verify(challengeId, otp);
  }
  publicAccount(account: AccountRecord) {
    return publicAccount(account);
  }
  principal(req: Request, mutating = false) {
    const authorization = req.headers.authorization;
    return this.sessions.principal(
      {
        token: authorization?.startsWith('Bearer ')
          ? authorization.slice(7)
          : req.cookies?.marleva_session,
        native: !!authorization,
        origin: req.headers.origin,
        csrfToken: req.headers['x-csrf-token'],
      },
      mutating,
    );
  }
  recent(p: Principal) {
    return this.sessions.recent(p);
  }
  logout(p: Principal, all = false) {
    return this.sessions.logout(p, all);
  }
  csrf(p: Principal) {
    return this.sessions.csrf(p);
  }
  emailChange(p: Principal, newAddress: unknown) {
    return this.emailChanges.emailChange(p, newAddress);
  }
  confirmEmail(p: Principal, changeId: unknown, address: unknown, otp: unknown) {
    return this.emailChanges.confirmEmail(p, changeId, address, otp);
  }
  finishEmailChange(id: string, accountId: string, oldEmail: string, newEmail: string) {
    return this.emailChanges.finishEmailChange(id, accountId, oldEmail, newEmail);
  }
  reconcile() {
    return this.emailChanges.reconcile();
  }
  factors(p: Principal) {
    return this.mfa.factors(p);
  }
  enroll(p: Principal) {
    return this.mfa.enroll(p);
  }
  verifyFactor(p: Principal, factorId: unknown, otp: unknown) {
    return this.mfa.verifyFactor(p, factorId, otp);
  }
  operator(p: Principal) {
    return this.mfa.operator(p);
  }
}
