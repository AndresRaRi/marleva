import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { recoveryContext } from './recovery-context.mjs';
const context = recoveryContext();
assert.ok(context.isolated);
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
process.loadEnvFile(context.envFile);
assert.equal(new URL(process.env.DATABASE_URL).port, '54722');
assert.equal(new URL(process.env.SUPABASE_URL).port, '54721');
mkdirSync(context.folder, { recursive: true, mode: 0o700 });
for (const args of [
  ['pnpm', '--filter', '@marleva/api', 'migrate'],
  ['node', 'tests/fixtures/recovery-fixtures.mjs'],
]) {
  const result = spawnSync('./scripts/tool', args, {
    env: process.env,
    encoding: 'utf8',
    timeout: 120000,
  });
  writeFileSync(
    context.folder + '/' + args[0] + '-prepare.private.log',
    result.stdout + result.stderr,
    { mode: 0o600 },
  );
  assert.equal(result.status, 0, 'Preparación falló; detalle privado por etapa');
}
console.log('B12: migraciones y dataset propio preparados; no se usó el origen de desarrollo');
