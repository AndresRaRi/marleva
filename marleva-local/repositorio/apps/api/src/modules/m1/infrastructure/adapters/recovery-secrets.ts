import { createHmac } from 'node:crypto';
import { config } from '../../../../config.js';
import { seal, unseal, secret, digest, equalHash } from '../../../../security.js';
import type { RecoverySecrets } from '../../application/ports/recovery-provider.js';
export class LocalRecoverySecrets implements RecoverySecrets {
  seal(value: unknown) {
    return seal(value, config().TOKEN_ENCRYPTION_KEY);
  }
  unseal<T>(value: string) {
    return unseal<T>(value, config().TOKEN_ENCRYPTION_KEY);
  }
  random() {
    return secret();
  }
  hash(value: string) {
    return digest(value);
  }
  equals(value: string, hash: string) {
    return equalHash(value, hash);
  }
  fingerprint(value: unknown) {
    return createHmac('sha256', Buffer.from(config().TOKEN_ENCRYPTION_KEY, 'hex'))
      .update('marleva-recovery-request\0' + JSON.stringify(value))
      .digest('hex');
  }
}
