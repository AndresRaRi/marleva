import { it, expect, afterAll, beforeAll, describe } from 'vitest';
import { randomUUID } from 'node:crypto';
import { database } from '../../../../apps/api/dist/database.js';
import { AccountService } from '../../../../apps/api/dist/account.service.js';
process.loadEnvFile(process.env.MARLEVA_ENV_FILE ?? new URL('../../../../.env', import.meta.url));
describe.skipIf(process.env.MARLEVA_CI_STACK !== '1')('UC001 proveedor aislado', () => {
  let db, service;
  beforeAll(() => {
    if (process.env.APP_MODE !== 'local' || process.env.MARLEVA_CI_STACK !== '1')
      throw new Error('Requiere entorno CI local aislado');
    const target = new URL(process.env.DATABASE_URL);
    if (target.hostname !== '127.0.0.1' || target.port !== '54622')
      throw new Error('Requiere PostgreSQL del stack CI aislado en 127.0.0.1:54622');
    const provider = new URL(process.env.SUPABASE_URL);
    if (provider.origin !== 'http://127.0.0.1:54621')
      throw new Error('Requiere Auth del stack CI aislado en http://127.0.0.1:54621');
    db = database();
    service = new AccountService(db);
  });
  const origin = 'uc001-' + randomUUID();
  afterAll(async () => {
    if (!db) return;
    await db.challenge.deleteMany({ where: { origin } });
    await db.$disconnect();
  });
  it('MAR-M1-IT-BE-101-K | SEQ001:S030/S060 | mismo correo concurrente reserva una vez', async () => {
    const email = origin + '-same@example.test';
    const results = await Promise.allSettled([
      service.challenge(email, origin),
      service.challenge(email, origin),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected.reason.getStatus()).toBe(429);
    expect(await db.challenge.count({ where: { origin, email } })).toBe(1);
  }, 20000);
  it('MAR-M1-IT-BE-101-L | SEQ001:S030/S100 | red compartida bajo cuota permite correos distintos', async () => {
    const emails = ['a', 'b'].map((suffix) => origin + '-' + suffix + '@example.test');
    const results = await Promise.all(emails.map((email) => service.challenge(email, origin)));
    expect(new Set(results.map((result) => result.challenge_id)).size).toBe(2);
    expect(
      results.every((result) => result.mensaje === 'Si el correo es válido, recibirás un código'),
    ).toBe(true);
    expect(
      await db.challenge.count({ where: { origin, email: { in: emails }, state: 'open' } }),
    ).toBe(2);
  }, 20000);
});
