import { spawnSync } from 'node:child_process';
import { mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureCiTool } from './ci-tool.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
const folder = path.resolve('artifacts/ci/stack');
const supabase = await ensureCiTool('supabase');
const network = 'marleva-ci-loopback';
function run(binary, args, options = {}) {
  const result = spawnSync(binary, args, { cwd: root, encoding: 'utf8', ...options });
  if (result.status !== 0)
    throw new Error(`Falló ${path.basename(binary)} ${args[0]}: ${result.stderr?.slice(-2000)}`);
  return result.stdout;
}
function cli(args, options) {
  return run(supabase, [...args, '--workdir', folder], options);
}
const action = process.argv[2];
if (action === 'stop') {
  if (existsSync(folder + '/supabase/config.toml')) cli(['stop', '--yes']);
  console.log('Stack de ensayo detenido; datos de origen y copias B12 intactos.');
} else if (action === 'start') {
  mkdirSync(folder + '/supabase/templates', { recursive: true, mode: 0o700 });
  copyFileSync('infra/ci/supabase/config.toml', folder + '/supabase/config.toml');
  copyFileSync('infra/local/supabase/templates/otp.html', folder + '/supabase/templates/otp.html');
  if (spawnSync('docker', ['network', 'inspect', network], { stdio: 'ignore' }).status !== 0)
    run('docker', [
      'network',
      'create',
      '--driver',
      'bridge',
      '--opt',
      'com.docker.network.bridge.host_binding_ipv4=127.0.0.1',
      network,
    ]);
  cli(
    [
      'start',
      '--network-id',
      network,
      '--exclude',
      'realtime,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor',
      '--yes',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'], timeout: 600000 },
  );
  const state = JSON.parse(cli(['status', '--output', 'json']));
  const previous = existsSync(folder + '/.env')
    ? parseEnv(readFileSync(folder + '/.env', 'utf8'))
    : {};
  const env = {
    APP_MODE: 'local',
    PAYMENT_MODE: 'simulated',
    APP_ORIGIN: 'https://localhost:8443',
    SUPABASE_URL: 'http://127.0.0.1:54621',
    SUPABASE_ANON_KEY: state.ANON_KEY,
    SUPABASE_SERVICE_KEY: state.SERVICE_ROLE_KEY,
    TOKEN_ENCRYPTION_KEY: previous.TOKEN_ENCRYPTION_KEY ?? randomBytes(32).toString('hex'),
    BOOTSTRAP_DATABASE_URL: state.DB_URL,
    DATABASE_URL: '',
    MIGRATION_DATABASE_URL: '',
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: '54625',
    MAILPIT_URL: 'http://127.0.0.1:54624',
    MARLEVA_CI_STACK: '1',
    MARLEVA_FIXTURE_IDENTITIES: folder + '/fixture-identities.json',
    MARLEVA_CERT_DIR: folder + '/certs',
    MARLEVA_CA_FILE: folder + '/certs/ca.crt',
  };
  for (const [key, user] of [
    ['DATABASE_URL', 'marleva_api'],
    ['MIGRATION_DATABASE_URL', 'marleva_migrator'],
  ]) {
    const url = new URL(state.DB_URL);
    url.username = user;
    url.password = previous[key]
      ? new URL(previous[key]).password
      : randomBytes(24).toString('hex');
    url.searchParams.set('schema', 'marleva');
    env[key] = url.toString();
  }
  const containers = JSON.parse(
    run('docker', [
      'inspect',
      'supabase_db_marleva-ci',
      'supabase_kong_marleva-ci',
      'supabase_inbucket_marleva-ci',
    ]),
  );
  for (const container of containers)
    for (const ports of Object.values(container.NetworkSettings.Ports))
      for (const port of ports ?? [])
        if (port.HostIp !== '127.0.0.1') throw new Error('Puerto CI expuesto fuera de loopback');
  writeFileSync(
    folder + '/.env',
    Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n',
    { mode: 0o600 },
  );
  run(process.execPath, ['apps/api/bootstrap.mjs'], { env: { ...process.env, ...env } });
  run('sh', ['scripts/create-certificates.sh'], { env: { ...process.env, ...env } });
  writeFileSync(
    'artifacts/ci/stack-ready.json',
    JSON.stringify({
      date: new Date().toISOString(),
      project: 'marleva-ci',
      loopbackOnly: true,
      databaseMajor: 17,
    }),
  );
  console.log(
    'Stack CI PG17/Auth/Storage/correo preparado en loopback; credenciales privadas ignoradas.',
  );
} else throw new Error('Uso: ci-stack.mjs start|stop');
