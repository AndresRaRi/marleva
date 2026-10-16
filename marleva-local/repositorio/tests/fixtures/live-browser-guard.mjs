import assert from 'node:assert/strict';

export function assertLiveBrowserTarget(env, address) {
  assert.equal(env.MARLEVA_CI_STACK, '1', 'Solo stack CI identificado');
  assert.equal(env.APP_MODE, 'local');
  const database = new URL(env.DATABASE_URL);
  const auth = new URL(env.SUPABASE_URL);
  const mail = new URL(env.MAILPIT_URL);
  assert.ok(['postgres:', 'postgresql:'].includes(database.protocol));
  assert.equal(database.username, 'marleva_api');
  assert.equal(database.pathname, '/postgres');
  assert.equal(database.hash, '');
  assert.ok(
    database.search === '' ||
      (database.searchParams.size === 1 && database.searchParams.get('schema') === 'marleva'),
    'Solo parámetro schema=marleva, sin opciones de conexión',
  );
  assert.equal(database.hostname, '127.0.0.1');
  assert.equal(database.port, '54622');
  assert.equal(auth.origin, 'http://127.0.0.1:54621');
  assert.equal(mail.origin, 'http://127.0.0.1:54624');
  assert.equal(auth.href, auth.origin + '/');
  assert.equal(mail.href, mail.origin + '/');
  assert.match(address, /^web-(?:other-)?\d{13}@example\.test$/);
}
