import type { AccountData } from './account-repository.js';
import type { AccountIdentity } from './account-identity.js';
type TransactionData = Pick<AccountData, 'revokeSessions' | 'audit'>;
export type SessionAccountRepository = Pick<
  AccountData,
  | 'sessionByHash'
  | 'touchSession'
  | 'requiredAccount'
  | 'updateSession'
  | 'claimRefresh'
  | 'storeTokensIfActive'
  | 'requiredSession'
> & { transaction<T>(work: (data: TransactionData) => Promise<T>): Promise<T> };
export type SessionIdentity = Pick<AccountIdentity, 'user' | 'refresh'>;

export type SessionCredentials = {
  token: unknown;
  native: boolean;
  origin?: string;
  csrfToken?: string | string[];
};
