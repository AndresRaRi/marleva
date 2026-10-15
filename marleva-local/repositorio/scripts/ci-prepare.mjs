import { spawnSync } from 'node:child_process';
const run = spawnSync('pnpm', ['--filter', '@marleva/api', 'generate'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    MIGRATION_DATABASE_URL:
      process.env.MIGRATION_DATABASE_URL ?? 'postgresql://fixture:fixture@127.0.0.1:54322/postgres',
  },
});
if (run.error) throw run.error;
process.exitCode = run.status ?? 1;
