import { spawnSync } from 'node:child_process';
const run = spawnSync(
  process.execPath,
  [
    'apps/api/node_modules/prisma/build/index.js',
    'generate',
    '--config',
    'apps/api/prisma-m3/prisma.config.ts',
  ],
  { stdio: 'inherit' },
);
if (run.error) throw run.error;
process.exitCode = run.status ?? 1;
