import assert from 'node:assert/strict';
import { assertCiTarget } from './live-browser-guard.mjs';
export function assertMigrationTarget(env) {
  assertCiTarget(env);
  for (const [key, user] of [
    ['BOOTSTRAP_DATABASE_URL', 'postgres'],
    ['MIGRATION_DATABASE_URL', 'marleva_migrator'],
  ]) {
    const url = new URL(env[key]);
    assert.ok(['postgres:', 'postgresql:'].includes(url.protocol));
    assert.equal(url.hostname, '127.0.0.1');
    assert.equal(url.port, '54622');
    assert.equal(url.username, user);
    assert.equal(url.pathname, '/postgres');
    assert.equal(url.hash, '');
    assert.ok(
      url.search === '' ||
        (url.searchParams.size === 1 && url.searchParams.get('schema') === 'marleva'),
    );
  }
}
