export type RecoveryState =
  | 'requested'
  | 'approved'
  | 'executing'
  | 'provider_pending'
  | 'reenrollment'
  | 'completed'
  | 'rejected'
  | 'expired';
export type RecoveryTokens = { access_token: string; refresh_token: string; expires_at: number };
export type RecoveryActor = {
  accountId: string;
  authId: string;
  sessionId: string;
  authenticatedAt: Date;
  tokens: RecoveryTokens;
};
export type RecoveryOperation = {
  hash: string;
  response?: string;
  expiresAt?: string;
  status?: 'pending' | 'done' | 'failed';
  reason?: string;
};
export type RecoveryProviderState = {
  authId: string;
  tokensEnvelope: string;
  factorIds: string[];
  revoked?: boolean;
};
export type RecoveryRecord = {
  id: string;
  accountId: string;
  requestedBy: string;
  approvedBy: string | null;
  state: RecoveryState;
  reason: string;
  providerReference: string | null;
  requestKey: string;
  requestHash: string;
  approvedAt: Date | null;
  operations: Record<string, RecoveryOperation>;
  providerState: RecoveryProviderState | Record<string, never>;
  leaseToken: string | null;
  leaseUntil: Date | null;
  capabilitySessionId: string | null;
  capabilityExpiresAt: Date | null;
  capabilityAttempts: number;
  capabilityConsumedAt: Date | null;
  factorId: string | null;
  capabilityHash: string | null;
  createdAt: Date;
  expiresAt: Date;
  completedAt: Date | null;
  version: number;
};
export type RecoveryProjection = Pick<RecoveryRecord, 'id' | 'state' | 'version'>;
export type RecoveryEnrollment = { factor_id: string; uri: string; qr_code: string };
export const recoveryProjection = ({ id, state, version }: RecoveryRecord): RecoveryProjection => ({
  id,
  state,
  version,
});
export const activeRecoveryStates: RecoveryState[] = [
  'requested',
  'approved',
  'executing',
  'provider_pending',
  'reenrollment',
];
