import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const env = {
  ...process.env,
  ...parseEnv(readFileSync('artifacts/ci/stack/.env', 'utf8')),
  MARLEVA_CAPTURE_DIR: path.resolve('artifacts/ci/capturas'),
};
if (env.MARLEVA_CI_STACK !== '1') throw new Error('Requiere stack de ensayo CI');
for (const [binary, args] of [
  ['pnpm', ['test:frontend:integration']],
  [
    process.execPath,
    [require.resolve('@lhci/cli/src/cli.js'), 'autorun', '--config=infra/ci/lighthouserc.cjs'],
  ],
]) {
  const result = spawnSync(binary, args, { env, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Falló web accesible: ${args.join(' ')}`);
}
