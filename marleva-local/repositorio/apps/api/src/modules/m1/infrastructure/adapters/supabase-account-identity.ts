import { identity, identityAdmin, authenticatedIdentity, tokens } from '../../../../identity.js';
import type {
  AccountIdentity,
  AccountIdentitySession,
} from '../../application/ports/account-identity.js';
import type { AccountTokens } from '../../domain/account-records.js';
export class SupabaseAccountIdentity implements AccountIdentity {
  sendCode(email: string) {
    return identity().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  }
  async verifyCode(email: string, code: string, type: 'email' | 'email_change') {
    const result = await identity().auth.verifyOtp({ email, token: code, type });
    return {
      error: result.error,
      data: {
        user: result.data?.user ?? null,
        session: result.data?.session ? tokens(result.data.session) : null,
      },
    };
  }
  user(token: string) {
    return identity().auth.getUser(token);
  }
  async refresh(token: string) {
    const result = await identity().auth.refreshSession({ refresh_token: token });
    return {
      error: result.error,
      data: { session: result.data?.session ? tokens(result.data.session) : null },
    };
  }
  adminUser(id: string) {
    return identityAdmin().auth.admin.getUserById(id);
  }
  async authenticated(value: AccountTokens) {
    const { client, tokens: current } = await authenticatedIdentity(value);
    const session: AccountIdentitySession = {
      updateEmail: (email) => client.auth.updateUser({ email }),
      factors: () => client.auth.mfa.listFactors(),
      assurance: () => client.auth.mfa.getAuthenticatorAssuranceLevel(),
      enroll: () => client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Marleva local' }),
      verify: async (factorId, code) => {
        const result = await client.auth.mfa.challengeAndVerify({ factorId, code });
        return { error: result.error, data: result.data ? tokens(result.data) : null };
      },
    };
    return { client: session, tokens: current };
  }
}
