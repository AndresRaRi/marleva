import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

export const authPoolEnv = 'GOTRUE_DB_MAX_POOL_SIZE=20\nGOTRUE_DB_MAX_IDLE_POOL_SIZE=20\n';
export function assertAuthTarget(container, context) {
  assert.ok(['marleva-ci', 'marleva-b12-source-006', 'marleva-m1'].includes(context.project));
  assert.ok(path.isAbsolute(context.folder));
  assert.equal(container.Name, '/supabase_auth_' + context.project);
  assert.equal(container.Config.Labels['com.supabase.cli.project'], context.project);
  assert.equal(container.Config.Labels['com.supabase.cli.workdir'], path.resolve(context.folder));
  assert.equal(container.Config.WorkingDir || '/', '/');
  assert.ok(container.State.Running);
}
export function appliedAuthPool(log) {
  let found;
  for (const line of log.split('\n')) {
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (row.limit_strategy !== 'fixed' || !('limit_max_idle_conns' in row)) continue;
    found = {
      maxOpen: safeLimit(row.limit_max_open_conns),
      maxIdle: safeLimit(row.limit_max_idle_conns),
    };
  }
  return found;
}
const safeLimit = (value) =>
  Number.isSafeInteger(value) && value >= 0 && value <= 10000 ? value : null;
function docker(args, allowMissing = false) {
  const result = spawnSync('docker', args, { encoding: 'utf8', timeout: 30000 });
  if (allowMissing && result.status === 1) return '';
  assert.equal(result.status, 0, 'No se pudo configurar/verificar el pool Auth propio');
  return (result.stdout ?? '') + (result.stderr ?? '');
}
export async function configureAuthPool(context, run = docker, pause = wait) {
  const name = 'supabase_auth_' + context.project;
  const container = JSON.parse(run(['inspect', name]))[0];
  assertAuthTarget(container, context);
  const previous = run(['exec', name, 'sh', '-c', 'test ! -f /.env || cat /.env']);
  assert.ok(
    !previous || previous === authPoolEnv,
    'Configuración Auth previa ajena; no sobrescribir',
  );
  const filename = path.join(mkdtempSync(path.join(os.tmpdir(), 'marleva-auth-pool-')), 'pool.env');
  writeFileSync(filename, authPoolEnv, { mode: 0o644 });
  run(['cp', filename, name + ':/.env']);
  const since = new Date().toISOString();
  run(['restart', '--time', '10', name]);
  return verifyAuthPool(name, since, run, pause);
}
async function verifyAuthPool(name, since, run, pause) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const pool = appliedAuthPool(run(['logs', '--since', since, name]));
    if (pool) {
      assert.deepEqual(pool, { maxOpen: 20, maxIdle: 20 }, 'Auth no aplicó el pool requerido');
      const health = run(['exec', name, 'wget', '-qO-', 'http://127.0.0.1:9999/health'], true);
      if (health) return { ...pool, verified: true };
    }
    await pause(200);
  }
  throw new Error('No se confirmó el pool Auth en el arranque');
}
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const context = {
    project: process.argv[2],
    folder: path.resolve(process.argv[3] ?? 'infra/local'),
  };
  console.log(await configureAuthPool(context));
}
