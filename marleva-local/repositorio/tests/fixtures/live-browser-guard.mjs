import assert from 'node:assert/strict';

export function assertLiveBrowserTarget(env, address) {
  assert.equal(env.MARLEVA_CI_STACK, '1', 'Solo stack CI identificado');
  assert.equal(env.APP_MODE, 'local');
  const database = new URL(env.DATABASE_URL);
  const auth = new URL(env.SUPABASE_URL);
  const mail = new URL(env.MAILPIT_URL);
  assert.equal(database.hostname, '127.0.0.1');
  assert.equal(database.port, '54622');
  assert.equal(auth.origin, 'http://127.0.0.1:54621');
  assert.equal(mail.origin, 'http://127.0.0.1:54624');
  assert.match(address, /^web-(?:other-)?\d{13}@example\.test$/);
}
