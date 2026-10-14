import type { RecoveryRecord } from '../../domain/entities/mfa-recovery.js';
export interface RecoveryTransaction {
  get(id: string): Promise<RecoveryRecord | null>;
  operationKey(key: string, id: string): Promise<void>;
  byRequest(accountId: string, key: string): Promise<RecoveryRecord | null>;
  requiresRecovery(accountId: string): Promise<boolean>;
  active(accountId: string): Promise<RecoveryRecord | null>;
  create(record: RecoveryRecord): Promise<RecoveryRecord>;
  save(record: RecoveryRecord): Promise<RecoveryRecord>;
  hasRole(accountId: string, role: 'm1_operator' | 'm1_access_admin'): Promise<boolean>;
  sessionActive(accountId: string, sessionId: string): Promise<boolean>;
  revoke(accountId: string): Promise<void>;
  audit(actorId: string, action: string, recoveryId: string): Promise<void>;
}
export interface RecoveryRepository {
  atomic<T>(lock: string, operation: (tx: RecoveryTransaction) => Promise<T>): Promise<T>;
  get(id: string): Promise<RecoveryRecord | null>;
  pending(): Promise<RecoveryRecord[]>;
  cleanups(): Promise<RecoveryRecord[]>;
}
