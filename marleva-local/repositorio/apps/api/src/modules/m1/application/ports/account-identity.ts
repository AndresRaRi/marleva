import type { AccountTokens } from '../../domain/account-records.js';
type IdentityResult<T> = { data: T; error: unknown };
type IdentityFactor = {
  id: string;
  factor_type: string;
  friendly_name?: string;
  status: string;
};
type IdentityFactors = { all: IdentityFactor[]; totp: IdentityFactor[] };
type EnrolledFactor = { id: string; totp: { qr_code: string; secret: string; uri: string } };
export interface AccountIdentitySession {
  updateEmail(email: string): Promise<IdentityResult<unknown>>;
  factors(): Promise<IdentityResult<IdentityFactors | null>>;
  assurance(): Promise<IdentityResult<{ currentLevel: string | null } | null>>;
  enroll(): Promise<IdentityResult<EnrolledFactor | null>>;
  verify(factorId: string, code: string): Promise<IdentityResult<AccountTokens | null>>;
}
export interface AccountIdentity {
  sendCode(email: string): Promise<{ error: unknown }>;
  verifyCode(
    email: string,
    code: string,
    type: 'email' | 'email_change',
  ): Promise<IdentityResult<{ session: AccountTokens | null; user: { id: string } | null }>>;
  user(token: string): Promise<IdentityResult<{ user: { id: string } | null }>>;
  refresh(token: string): Promise<IdentityResult<{ session: AccountTokens | null }>>;
  adminUser(id: string): Promise<IdentityResult<{ user: { email?: string } | null }>>;
  authenticated(
    tokens: AccountTokens,
  ): Promise<{ client: AccountIdentitySession; tokens: AccountTokens }>;
}
