import type { AccountData } from './account-repository.js';
import type { AccountIdentity } from './account-identity.js';
type TransactionData = Pick<
  AccountData,
  | 'lockKey'
  | 'activeEmailChange'
  | 'createEmailChange'
  | 'emailChange'
  | 'claimEmailChange'
  | 'requiredEmailChange'
  | 'setAccountEmail'
  | 'revokeSessions'
  | 'updateEmailChange'
  | 'notice'
  | 'outbox'
  | 'audit'
>;
export type EmailAccountRepository = Pick<
  AccountData,
  'accountForEmail' | 'updateEmailChange' | 'emailReconciliations' | 'requiredAccount'
> & { transaction<T>(work: (data: TransactionData) => Promise<T>): Promise<T> };
export type EmailIdentity = Pick<AccountIdentity, 'verifyCode' | 'adminUser' | 'authenticated'>;
