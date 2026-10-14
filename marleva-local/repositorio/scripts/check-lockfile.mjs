import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
process.chdir(root);
const hash = async () =>
  createHash('sha256')
    .update(await readFile('pnpm-lock.yaml'))
    .digest('hex');
const before = await hash();
const result = spawnSync(
  path.join(root, 'scripts/tool'),
  ['pnpm', 'install', '--frozen-lockfile'],
  { cwd: root, stdio: 'inherit' },
);
if (result.status !== 0) process.exit(result.status ?? 1);
const after = await hash();
if (before !== after) throw new Error('Lockfile changed during frozen installation');
console.log('Frozen lockfile verified: ' + after);
