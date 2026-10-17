import { expect, it } from 'vitest';
import { assertMigrationTarget } from '../../../fixtures/migration-target.mjs';
const env = {
  APP_MODE: 'local',
  MARLEVA_CI_STACK: '1',
  DATABASE_URL: 'postgresql://marleva_api@127.0.0.1:54622/postgres',
  BOOTSTRAP_DATABASE_URL: 'postgresql://postgres@127.0.0.1:54622/postgres',
  MIGRATION_DATABASE_URL: 'postgresql://marleva_migrator@127.0.0.1:54622/postgres?schema=marleva',
  SUPABASE_URL: 'http://127.0.0.1:54621',
  MAILPIT_URL: 'http://127.0.0.1:54624',
};
it('MAR-M1-UT-BE-113-MIGRATION-TARGET | bases CI propias permitidas', () => {
  expect(() => assertMigrationTarget(env)).not.toThrow();
});
it.each(['BOOTSTRAP_DATABASE_URL', 'MIGRATION_DATABASE_URL'])(
  'MAR-M1-UT-BE-113-MIGRATION-REJECT | %s rechaza host, puerto, base, rol u opciones ajenas',
  (key) => {
    for (const [part, value] of [
      ['hostname', 'example.test'],
      ['port', '54322'],
      ['pathname', '/other'],
      ['username', 'other'],
      ['search', '?options=private'],
      ['hash', '#other'],
      ['protocol', 'https:'],
    ]) {
      const url = new URL(env[key]);
      url[part] = value;
      const changed =
        part === 'protocol' ? url.toString().replace(/^postgresql:/, 'https:') : url.toString();
      expect(() => assertMigrationTarget({ ...env, [key]: changed })).toThrow();
    }
  },
);
