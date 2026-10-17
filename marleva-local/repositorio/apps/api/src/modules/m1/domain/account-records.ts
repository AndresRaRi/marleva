export type AccountRecord = {
  id: string;
  authId: string;
  email: string;
  state: string;
  operator: boolean;
  createdAt: Date;
};
export type SessionRecord = {
  id: string;
  accountId: string;
  tokenHash: string;
  csrfHash: string;
  providerTokens: string;
  createdAt: Date;
  lastSeen: Date;
  authenticatedAt: Date;
  revokedAt: Date | null;
  refreshLease: Date | null;
};
export type ChallengeRecord = {
  id: string;
  email: string;
  origin: string;
  state: string;
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
  blockedUntil: Date | null;
};
export type EmailChangeRecord = {
  id: string;
  accountId: string;
  oldEmail: string;
  newEmail: string;
  providerTokens: string;
  oldConfirmed: boolean;
  newConfirmed: boolean;
  state: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
};
export type AccountTokens = { access_token: string; refresh_token: string; expires_at: number };
export type AccountPrincipal = {
  session: SessionRecord;
  account: AccountRecord;
  tokens: AccountTokens;
};
export function publicAccount(a: AccountRecord) {
  return {
    id: a.id,
    correo: a.email,
    estado: a.state,
    pertenencia: 'no_solicitada',
    operador: a.operator,
    acciones_permitidas: ['cuenta', 'salir', 'cambiar_correo'],
  };
}
