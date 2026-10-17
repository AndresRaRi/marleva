import type { AccountTokens } from '../../domain/account-records.js';
export interface AccountSecrets {
  encrypt(tokens: AccountTokens): string;
  decrypt(value: string): AccountTokens;
}
