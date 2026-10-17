import type { AccountData } from './account-repository.js';
import type { AccountIdentity } from './account-identity.js';
export type OperatorAccountRepository = Pick<
  AccountData,
  'activeRecovery' | 'latestApprovedRecovery' | 'audit' | 'updateSession'
>;
export type OperatorIdentity = Pick<AccountIdentity, 'authenticated'>;
