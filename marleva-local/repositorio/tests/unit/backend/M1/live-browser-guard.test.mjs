import { it, expect } from 'vitest';
import { assertLiveBrowserTarget } from '../../../fixtures/live-browser-guard.mjs';
const target = {
  MARLEVA_CI_STACK: '1',
  APP_MODE: 'local',
  DATABASE_URL: 'postgresql://marleva_api:fixture@127.0.0.1:54622/postgres',
  SUPABASE_URL: 'http://127.0.0.1:54621',
  MAILPIT_URL: 'http://127.0.0.1:54624',
};
it('UT108-LIVE | permite únicamente CI local y destinatario ficticio cerrado', () => {
  expect(() => assertLiveBrowserTarget(target, 'web-1792118849918@example.test')).not.toThrow();
  expect(() =>
    assertLiveBrowserTarget(target, 'web-other-1792118849918@example.test'),
  ).not.toThrow();
});
it('UT108-LIVE | admite únicamente schema=marleva del stack real', () => {
  expect(() =>
    assertLiveBrowserTarget(
      { ...target, DATABASE_URL: target.DATABASE_URL + '?schema=marleva' },
      'web-1792118849918@example.test',
    ),
  ).not.toThrow();
});
it.each([
  ['MARLEVA_CI_STACK', '0'],
  ['DATABASE_URL', target.DATABASE_URL + '?port=54322'],
  ['DATABASE_URL', target.DATABASE_URL + '?host=remote.invalid'],
  ['DATABASE_URL', target.DATABASE_URL + '?schema=marleva&port=54722'],
  ['DATABASE_URL', target.DATABASE_URL + '?schema=marleva&schema=marleva'],
  ['DATABASE_URL', target.DATABASE_URL.replace('/postgres', '/other')],
  ['DATABASE_URL', target.DATABASE_URL.replace('marleva_api', 'postgres')],
  ['SUPABASE_URL', target.SUPABASE_URL + '/other'],
  ['MAILPIT_URL', target.MAILPIT_URL + '?host=remote.invalid'],
  ['APP_MODE', 'production'],
  ['DATABASE_URL', 'postgresql://marleva_api:fixture@127.0.0.1:54322/postgres'],
  ['DATABASE_URL', 'postgresql://marleva_api:fixture@127.0.0.1:54722/postgres'],
  ['DATABASE_URL', 'postgresql://marleva_api:fixture@remote.invalid:54622/postgres'],
  ['SUPABASE_URL', 'http://127.0.0.1:54321'],
  ['MAILPIT_URL', 'http://127.0.0.1:54724'],
])('UT108-LIVE | bloquea destino ajeno %s=%s antes de conectar', (key, value) => {
  expect(() =>
    assertLiveBrowserTarget({ ...target, [key]: value }, 'web-1792118849918@example.test'),
  ).toThrow();
});
it.each(['persona@example.com', 'web-fixture@example.test', 'web-1792118849918@example.test.evil'])(
  'UT108-LIVE | bloquea identidad no designada %s',
  (address) => {
    expect(() => assertLiveBrowserTarget(target, address)).toThrow();
  },
);
