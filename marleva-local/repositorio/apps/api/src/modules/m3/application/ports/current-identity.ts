import type { Actor } from '../../domain/offer-transition.js';
export interface IdentityRequest {
  authorization?: string;
  cookie?: string;
  origin?: string;
  csrfToken?: string;
  mutation: boolean;
}
// The adapter must verify current session, revocation, roles/MFA and cookie-bound CSRF.
// A token's unverified claims or an actor supplied by the caller are never an identity.
export interface AuthenticatedActor extends Actor {
  csrfToken?: string;
}
export interface CurrentIdentity {
  resolve(request: IdentityRequest): Promise<AuthenticatedActor>;
}
