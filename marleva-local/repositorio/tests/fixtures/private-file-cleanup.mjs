import { createHash } from 'node:crypto';
// Clean only objects explicitly created by this runner; preserve a consistent deletion ledger.
export async function cleanupPrivateFixtures(db, admin, storage, keys) {
  if (!keys.length) return;
  const result = await admin.storage.from('m1-private').remove(keys);
  if (result.error) throw new Error('No se pudo limpiar Storage ficticio');
  for (const objectKey of keys) {
    if (!(await storage.absent(objectKey))) throw new Error('Objeto ficticio aún presente');
    const item = await db.privateFixture.findUnique({ where: { objectKey } });
    if (!item || item.state === 'deleted') continue;
    const now = new Date();
    await db.$transaction(async (tx) => {
      const task = await tx.fixtureDeletion.findUnique({ where: { fixtureId: item.id } });
      if (task)
        await tx.fixtureDeletion.update({
          where: { id: task.id },
          data: { state: 'completed', completedAt: now, leaseUntil: null },
        });
      else
        await tx.fixtureDeletion.create({
          data: {
            fixtureId: item.id,
            accountId: item.accountId,
            idempotencyKey: 'fixture-cleanup-' + item.id,
            requestHash: createHash('sha256').update(objectKey).digest('hex'),
            expectedVersion: item.version,
            state: 'completed',
            createdAt: now,
            completedAt: now,
          },
        });
      await tx.privateFixture.update({
        where: { id: item.id },
        data: {
          state: 'deleted',
          deleteRequestedAt: item.deleteRequestedAt ?? now,
          deletedAt: now,
          version: { increment: 1 },
        },
      });
    });
  }
}
