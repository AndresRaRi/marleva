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
if (run.status === 0) {
  const m3 = spawnSync(process.execPath, ['scripts/m3-prepare.mjs'], { stdio: 'inherit' });
  if (m3.error) throw m3.error;
  process.exitCode = m3.status ?? 1;
} else process.exitCode = run.status ?? 1;
