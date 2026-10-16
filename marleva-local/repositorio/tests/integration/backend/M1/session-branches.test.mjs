import { beforeAll, afterAll, it, expect, describe } from 'vitest';
import { assertCiTarget } from '../../../fixtures/live-browser-guard.mjs';
import { randomUUID } from 'node:crypto';
import { database } from '../../../../apps/api/dist/database.js';
import { AccountService } from '../../../../apps/api/dist/account.service.js';
import { seal, unseal, digest } from '../../../../apps/api/dist/security.js';
import { capturedCode } from '../../../integration/frontend/M1/live-otp.mjs';
process.loadEnvFile(process.env.MARLEVA_ENV_FILE ?? new URL('../../../../.env', import.meta.url));
describe.skipIf(process.env.MARLEVA_CI_STACK !== '1')('M1 sesiones PG/Auth aislados', () => {
  let db, service;
  const prefix = 'session-' + randomUUID();
  beforeAll(() => {
    assertCiTarget(process.env);
    db = database();
    service = new AccountService(db);
  });
  afterAll(async () => db?.$disconnect());
  async function login() {
    const address = prefix + '-' + randomUUID() + '@example.test';
    const challenge = await service.challenge(address, prefix);
    const verified = await service.verify(
      challenge.challenge_id,
      await capturedCode(address, new Set()),
    );
    return { token: verified.token, account: verified.account };
  }
  const request = (token) => ({ headers: { authorization: 'Bearer ' + token }, cookies: {} });
  async function expireProvider(token) {
    const row = await db.session.findUniqueOrThrow({ where: { tokenHash: digest(token) } });
    const tokens = unseal(row.providerTokens, process.env.TOKEN_ENCRYPTION_KEY);
    tokens.expires_at = Math.floor(Date.now() / 1000) - 1;
    await db.session.update({
      where: { id: row.id },
      data: { providerTokens: seal(tokens, process.env.TOKEN_ENCRYPTION_KEY) },
    });
    return row.id;
  }
  function providerRequest(input, path) {
    const url = new URL(typeof input === 'string' ? input : (input.url ?? input.href));
    return url.origin === process.env.SUPABASE_URL && url.pathname === '/auth/v1/' + path;
  }
  it('MAR-M1-IT-BE-103-CONCURRENT | SEQ003:S020-S090 | ocho lecturas renuevan una vez con PG/Auth reales', async () => {
    const a = await login();
    const id = await expireProvider(a.token);
    const actualFetch = globalThis.fetch;
    let renewals = 0;
    globalThis.fetch = async (input, options) => {
      if (providerRequest(input, 'token') && String(input).includes('grant_type=refresh_token')) {
        renewals++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return actualFetch(input, options);
    };
    try {
      const results = await Promise.all(
        Array.from({ length: 8 }, () => service.principal(request(a.token))),
      );
      expect(results.every((result) => result.account.id === a.account.id)).toBe(true);
      expect(renewals).toBe(1);
      const row = await db.session.findUniqueOrThrow({ where: { id } });
      expect(row.refreshLease).toBeNull();
      expect(row.revokedAt).toBeNull();
      expect(
        unseal(row.providerTokens, process.env.TOKEN_ENCRYPTION_KEY).expires_at,
      ).toBeGreaterThan(Date.now() / 1000);
    } finally {
      globalThis.fetch = actualFetch;
    }
  }, 20000);
  it('MAR-M1-IT-BE-103-LEASE | SEQ003:S060-S090 | reserva ocupada conserva credenciales y reintento funciona', async () => {
    const a = await login();
    const id = await expireProvider(a.token);
    await db.session.update({
      where: { id },
      data: { refreshLease: new Date(Date.now() + 15000) },
    });
    const before = await db.session.findUniqueOrThrow({ where: { id } });
    try {
      await expect(service.principal(request(a.token))).rejects.toMatchObject({ status: 503 });
      const blocked = await db.session.findUniqueOrThrow({ where: { id } });
      expect(blocked.providerTokens).toBe(before.providerTokens);
      expect(blocked.revokedAt).toBeNull();
    } finally {
      await db.session.update({ where: { id }, data: { refreshLease: null } });
    }
    expect((await service.principal(request(a.token))).account.id).toBe(a.account.id);
  }, 20000);
  it('MAR-M1-IT-BE-104-RACE | SEQ004:S020-S070 | revocar durante consulta real impide devolver cuenta', async () => {
    const a = await login();
    const principal = await service.principal(request(a.token));
    const actualFetch = globalThis.fetch;
    let release, entered;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const started = new Promise((resolve) => {
      entered = resolve;
    });
    globalThis.fetch = async (input, options) => {
      if (providerRequest(input, 'user')) {
        entered();
        await gate;
      }
      return actualFetch(input, options);
    };
    let pending;
    try {
      pending = service.principal(request(a.token));
      const rejected = expect(pending).rejects.toMatchObject({ status: 401 });
      await Promise.race([
        started,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('No llegó consulta real')), 5000),
        ),
      ]);
      await service.logout(principal);
      release();
      await rejected;
      expect(
        (await db.session.findUniqueOrThrow({ where: { id: principal.session.id } })).revokedAt,
      ).not.toBeNull();
      await expect(service.principal(request(a.token))).rejects.toMatchObject({ status: 401 });
    } finally {
      release();
      globalThis.fetch = actualFetch;
      await pending?.catch(() => {});
    }
  }, 20000);
});
