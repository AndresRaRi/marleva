import { config } from '../../../../config.js';
import { seal, unseal } from '../../../../security.js';
import type { AccountSecrets } from '../../application/ports/account-secrets.js';
import type { AccountTokens } from '../../domain/account-records.js';
export class LocalAccountSecrets implements AccountSecrets {
  encrypt(tokens: AccountTokens) {
    return seal(tokens, config().TOKEN_ENCRYPTION_KEY);
  }
  decrypt(value: string) {
    return unseal<AccountTokens>(value, config().TOKEN_ENCRYPTION_KEY);
  }
}
