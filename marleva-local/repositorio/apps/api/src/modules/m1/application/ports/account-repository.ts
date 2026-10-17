import type {
  AccountRecord,
  SessionRecord,
  ChallengeRecord,
  EmailChangeRecord,
} from '../../domain/account-records.js';
export interface AccountData {
  lockOrigin(origin: string): Promise<unknown>;
  lockKey(key: string): Promise<unknown>;
  latestChallenge(address: string): Promise<ChallengeRecord | null>;
  recentOrigin(origin: string, since: Date): Promise<{ createdAt: Date }[]>;
  supersedeChallenges(address: string): Promise<unknown>;
  createChallenge(
    data: Pick<ChallengeRecord, 'id' | 'email' | 'origin' | 'expiresAt'>,
  ): Promise<unknown>;
  challenge(id: string): Promise<ChallengeRecord | null>;
  requiredChallenge(id: string): Promise<ChallengeRecord>;
  claimChallenge(id: string): Promise<ChallengeRecord>;
  updateChallenge(
    id: string,
    data: Partial<Pick<ChallengeRecord, 'state' | 'blockedUntil'>>,
  ): Promise<unknown>;
  openSentChallenge(id: string): Promise<unknown>;
  accountForAuth(authId: string, address: string): Promise<AccountRecord>;
  createSession(
    data: Pick<SessionRecord, 'accountId' | 'tokenHash' | 'csrfHash' | 'providerTokens'>,
  ): Promise<SessionRecord>;
  audit(data: { accountId: string; action: string; resourceId?: string }): Promise<unknown>;
  sessionByHash(hash: string): Promise<(SessionRecord & { account: AccountRecord }) | null>;
  touchSession(id: string, now: Date): Promise<{ count: number }>;
  requiredAccount(id: string): Promise<AccountRecord>;
  updateSession(
    id: string,
    data: Partial<
      Pick<SessionRecord, 'revokedAt' | 'refreshLease' | 'csrfHash' | 'providerTokens'>
    >,
  ): Promise<unknown>;
  claimRefresh(id: string, now: Date, until: Date): Promise<{ count: number }>;
  storeTokensIfActive(id: string, providerTokens: string): Promise<unknown>;
  requiredSession(id: string): Promise<SessionRecord>;
  revokeSessions(target: { accountId: string } | { id: string }, now: Date): Promise<unknown>;
  accountForEmail(address: string): Promise<AccountRecord | null>;
  activeEmailChange(accountId: string, now: Date): Promise<EmailChangeRecord | null>;
  createEmailChange(
    data: Pick<
      EmailChangeRecord,
      'id' | 'accountId' | 'oldEmail' | 'newEmail' | 'providerTokens' | 'expiresAt'
    >,
  ): Promise<unknown>;
  updateEmailChange(
    id: string,
    data: Partial<
      Pick<EmailChangeRecord, 'state' | 'providerTokens' | 'oldConfirmed' | 'newConfirmed'>
    >,
  ): Promise<unknown>;
  emailChange(id: string): Promise<EmailChangeRecord | null>;
  claimEmailChange(id: string): Promise<EmailChangeRecord>;
  requiredEmailChange(id: string): Promise<EmailChangeRecord>;
  setAccountEmail(id: string, address: string): Promise<unknown>;
  notice(data: { accountId: string; kind: string; text: string }): Promise<unknown>;
  outbox(data: {
    reference: string;
    recipient: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
  activeRecovery(accountId: string, now: Date): Promise<{ state: string } | null>;
  latestApprovedRecovery(accountId: string): Promise<{ state: string } | null>;
  emailReconciliations(): Promise<EmailChangeRecord[]>;
}
export interface AccountRepository extends AccountData {
  transaction<T>(work: (data: AccountData) => Promise<T>): Promise<T>;
}
