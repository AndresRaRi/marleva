import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const images = JSON.parse(readFileSync('infra/ci/images.json', 'utf8'));
function docker(args) {
  const result = spawnSync('docker', args, { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Docker falló: ${args.slice(0, 2).join(' ')}`);
}
mkdirSync('artifacts/security', { recursive: true });
mkdirSync('artifacts/cache/trivy', { recursive: true });
docker([
  'run',
  '--rm',
  '-v',
  `${process.cwd()}/infra/ci/Dockerfile:/Dockerfile:ro`,
  images.hadolint,
  'hadolint',
  '/Dockerfile',
]);
docker(['build', '--pull', '--file', 'infra/ci/Dockerfile', '--tag', 'marleva-api:ci', '.']);
// Import and serve health with fictitious configuration; no database connection or external service.
const fixture = {
  MARLEVA_TEST: '1',
  APP_MODE: 'local',
  PAYMENT_MODE: 'simulated',
  APP_ORIGIN: 'https://localhost:8443',
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_ANON_KEY: 'fixture',
  SUPABASE_SERVICE_KEY: 'fixture',
  TOKEN_ENCRYPTION_KEY: 'a'.repeat(64),
  DATABASE_URL: 'postgresql://fixture:fixture@127.0.0.1:54322/postgres',
  SMTP_HOST: '127.0.0.1',
  SMTP_PORT: '54325',
  MAILPIT_URL: 'http://127.0.0.1:54324',
};
docker([
  'run',
  '--rm',
  ...Object.entries(fixture).flatMap(([key, value]) => ['-e', `${key}=${value}`]),
  'marleva-api:ci',
  '--input-type=module',
  '-e',
  "import {makeApp} from './dist/main.js'; const app=await makeApp(); await app.listen(3000,'127.0.0.1'); const response=await fetch('http://127.0.0.1:3000/health/live'); await app.close(); if(!response.ok)process.exit(1); console.log('Imagen: arranque y salud correctos'); process.exit(0);",
]);
docker([
  'run',
  '--rm',
  '-v',
  '/var/run/docker.sock:/var/run/docker.sock:ro',
  '-v',
  `${path.resolve('artifacts/security')}:/report`,
  '-v',
  `${path.resolve('artifacts/cache/trivy')}:/cache`,
  images.trivy,
  '--quiet',
  '--cache-dir',
  '/cache',
  'image',
  '--scanners',
  'vuln',
  '--severity',
  'HIGH,CRITICAL',
  '--exit-code',
  '1',
  '--format',
  'json',
  '--output',
  '/report/image.json',
  'marleva-api:ci',
]);
