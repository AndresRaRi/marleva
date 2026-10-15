import { spawnSync } from 'node:child_process';
// Prisma configuration is read statically; this fixture URL is never connected.
const result = spawnSync('pnpm', ['exec', 'knip'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    MIGRATION_DATABASE_URL:
      process.env.MIGRATION_DATABASE_URL ?? 'postgresql://fixture:fixture@127.0.0.1:54322/postgres',
  },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
