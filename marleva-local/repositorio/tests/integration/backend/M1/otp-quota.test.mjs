import { it, expect, afterAll } from 'vitest';
import supertest from 'supertest';
import { randomUUID } from 'node:crypto';
import { database } from '../../../../apps/api/dist/database.js';
import { AccountService } from '../../../../apps/api/dist/account.service.js';
process.loadEnvFile(new URL('../../../../.env', import.meta.url));
if (process.env.MARLEVA_QUOTA_CHECK !== '1')
  throw new Error('Cuota local: requiere ejecución separada, no junto aOTP');
const db = database(),
  service = new AccountService(db),
  prefix = 'quota-' + Date.now(),
  ids = [];
afterAll(async () => {
  if (ids.length) await db.challenge.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
});
async function seed(origin, count, age) {
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const id = randomUUID();
    ids.push(id);
    await db.challenge.create({
      data: {
        id,
        email: `${prefix}-${i}-${origin === '127.0.0.1' ? 'http' : 'sql'}@example.test`,
        origin,
        state: 'superseded',
        createdAt: new Date(now - age + i),
        expiresAt: new Date(now - age + 600000 + i),
      },
    });
  }
}
it('MAR-M1-IT-BE-101-I | SEQ001:S030 | dos correos concurrentes no exceden cuota29+1', async () => {
  const origin = prefix + '-origin';
  await seed(origin, 29, 1000);
  const addresses = [prefix + '-a@example.test', prefix + '-b@example.test'];
  const result = await Promise.allSettled(
    addresses.map((address) => service.challenge(address, origin)),
  );
  const reserved = await db.challenge.findMany({ where: { origin } });
  ids.push(...reserved.map((r) => r.id));
  expect(reserved.length).toBe(30);
  expect(result.filter((r) => r.status === 'fulfilled').length).toBe(1);
  const error = result.find((r) => r.status === 'rejected').reason;
  expect(error.getStatus()).toBe(429);
  expect(error.retryAfter).toBeGreaterThan(3500);
}, 20000);
it('MAR-M1-IT-BE-101-J | SEQ001:S050 | cabecera HTTP y mensaje comunican los mismos segundos', async () => {
  const origin = '127.0.0.1';
  await seed(origin, 30, 1000);
  const response = await supertest('http://127.0.0.1:3000')
    .post('/v1/auth/challenges')
    .set('x-marleva-client', 'native')
    .send({ correo: prefix + '-header@example.test' });
  expect(response.status).toBe(429);
  const seconds = Number(response.headers['retry-after']);
  expect(seconds).toBeGreaterThan(3500);
  expect(seconds).toBeLessThanOrEqual(3600);
  expect(response.body.mensaje).toBe(`Espera ${seconds} segundos antes de continuar`);
  expect(response.body.accion_recuperacion).toBe(`Vuelve a intentar en ${seconds} segundos`);
}, 20000);
