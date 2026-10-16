import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { assertLiveBrowserTarget } from './live-browser-guard.mjs';

export async function liveBrowserData(address, credential) {
  assertLiveBrowserTarget(process.env, address);
  const { database } = await import('../../apps/api/dist/database.js');
  const db = database();
  const tokenHash = (value) => createHash('sha256').update(value).digest('hex');
  async function ownedSession(value, accountId) {
    const session = await db.session.findUnique({
      where: { tokenHash: tokenHash(value) },
      include: { account: true },
    });
    assert.ok(session && !session.revokedAt, 'Sesión ficticia vigente');
    assert.equal(session.account.email, address);
    if (accountId) assert.equal(session.accountId, accountId);
    return session;
  }
  try {
    const session = await ownedSession(credential);
    const createdAt = new Date();
    const rows = Array.from({ length: 55 }, (_, index) => ({
      id: randomUUID(),
      accountId: session.accountId,
      kind: 'live-browser-fixture',
      text: `Aviso real ${address} ${index + 1}`,
      createdAt,
    }));
    await db.notice.createMany({ data: rows });
    return {
      accountId: session.accountId,
      rows,
      async revoke(value) {
        const current = await ownedSession(value, session.accountId);
        const result = await db.session.updateMany({
          where: { id: current.id, accountId: session.accountId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        assert.equal(result.count, 1);
      },
      close: () => db.$disconnect(),
    };
  } catch (error) {
    await db.$disconnect();
    throw error;
  }
}
