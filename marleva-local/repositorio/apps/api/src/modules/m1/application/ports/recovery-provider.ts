import type { RecoveryEnrollment, RecoveryTokens } from '../../domain/entities/mfa-recovery.js';
export interface RecoveryProvider {
  assurance(tokens: RecoveryTokens): Promise<'aal1' | 'aal2'>;
  factors(authId: string): Promise<string[]>;
  reset(authId: string, factorIds: string[], tokens: RecoveryTokens): Promise<void>;
  enroll(authId: string, recoveryId: string, tokens: RecoveryTokens): Promise<RecoveryEnrollment>;
  verified(authId: string, factorId: string): Promise<boolean>;
  verify(
    authId: string,
    factorId: string,
    code: string,
    tokens: RecoveryTokens,
    replaying?: boolean,
  ): Promise<void>;
}
export interface RecoverySecrets {
  seal(value: unknown): string;
  unseal<T>(value: string): T;
  random(): string;
  hash(value: string): string;
  fingerprint(value: unknown): string;
  equals(value: string, hash: string): boolean;
}
