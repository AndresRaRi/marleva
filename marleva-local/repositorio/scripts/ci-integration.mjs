import { spawn, spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import { readFileSync, mkdirSync, openSync, closeSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const folder = path.resolve('artifacts/ci/stack');
const env = {
  ...process.env,
  ...parseEnv(readFileSync(folder + '/.env', 'utf8')),
  MARLEVA_ENV_FILE: folder + '/.env',
};
if (env.MARLEVA_CI_STACK !== '1') throw new Error('Requiere stack CI preparado');
const proxyExists = process.env.MARLEVA_CI_EXISTING_PROXY === '1';
const mode = process.argv[2] ?? 'backend';
if (!['backend', 'web', 'contract'].includes(mode)) throw new Error('Modalidad CI desconocida');
if (proxyExists) env.MARLEVA_CA_FILE = path.resolve('infra/local/secrets/ca.crt');
const children = [];
const outcomes = [];
function run(name, binary, args, extra = {}) {
  const result = spawnSync(binary, args, { env, stdio: 'inherit', ...extra });
  outcomes.push({ name, status: result.status ?? 1 });
  if (result.status !== 0) throw new Error(`Falló ${name}`);
}
function start(name, args) {
  const log = openSync(`${folder}/${name}.log`, 'a', 0o600);
  children.push(spawn(process.execPath, args, { env, stdio: ['ignore', log, log] }));
  closeSync(log);
}
try {
  // Never attach a test to a pre-existing API on the same port.
  try {
    await fetch('http://127.0.0.1:3000/health/live', { signal: AbortSignal.timeout(1000) });
    throw new Error('Puerto API ocupado; detener solo la API local antes del ensayo');
  } catch (error) {
    if (error.message.startsWith('Puerto API')) throw error;
  }
  run('build API', 'pnpm', ['--filter', '@marleva/api', 'build']);
  if (mode === 'web') run('build web', 'pnpm', ['--filter', '@marleva/client', 'build']);
  run('semillas ficticias', process.execPath, ['apps/api/seed.mjs']);
  if (!proxyExists) run('certificado CI', 'sh', ['scripts/create-certificates.sh']);
  start('api', ['apps/api/dist/main.js']);
  if (!proxyExists) start('https', ['scripts/proxy.mjs']);
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch('http://127.0.0.1:3000/health/ready')).status === 200) {
        ready = true;
        break;
      }
    } catch {
      /* Startup only; bounded readiness below. */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('API CI no quedó ready; revisar logs privados');
  if (mode === 'backend') {
    run('API real', 'pnpm', ['test:integration']);
    run('archivos y caída Storage', 'pnpm', ['test:files']);
    run('outbox y caída capturador', 'pnpm', ['test:outbox'], {
      env: { ...env, MARLEVA_OUTBOX_CHECK: '1' },
    });
    run('cuota y concurrencia', 'pnpm', ['test:quota'], {
      env: { ...env, MARLEVA_QUOTA_CHECK: '1' },
    });
    run('modelo objetivo', 'pnpm', ['test:schema'], { env: { ...env, MARLEVA_SCHEMA_CHECK: '1' } });
  } else if (mode === 'web') run('web y accesibilidad', process.execPath, ['scripts/ci-e2e.mjs']);
  else run('contrato generado', process.execPath, ['scripts/ci-contract.mjs']);
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode !== null) continue;
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 10000)),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
  mkdirSync('tests/results', { recursive: true });
  writeFileSync(
    `tests/results/ci-integration-${mode}.json`,
    JSON.stringify(
      {
        date: new Date().toISOString(),
        outcomes,
        limits: proxyExists
          ? 'Ensayo Mac usa proxy TLS existente y CA pública; API/datos/proveedor CI separados'
          : 'Ensayo CI local; no B12 integral ni plataformas nativas',
      },
      null,
      2,
    ) + '\n',
  );
}
