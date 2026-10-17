import type { AccountData } from './account-repository.js';
import type { AccountIdentity } from './account-identity.js';
type TransactionData = Pick<
  AccountData,
  | 'lockOrigin'
  | 'lockKey'
  | 'latestChallenge'
  | 'recentOrigin'
  | 'supersedeChallenges'
  | 'createChallenge'
  | 'challenge'
  | 'requiredChallenge'
  | 'claimChallenge'
  | 'updateChallenge'
  | 'accountForAuth'
  | 'createSession'
  | 'audit'
>;
export type AccessAccountRepository = Pick<AccountData, 'updateChallenge' | 'openSentChallenge'> & {
  transaction<T>(work: (data: TransactionData) => Promise<T>): Promise<T>;
};
export type AccessIdentity = Pick<AccountIdentity, 'sendCode' | 'verifyCode'>;
