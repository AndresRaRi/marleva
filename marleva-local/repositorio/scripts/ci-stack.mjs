import { spawnSync } from 'node:child_process';
import { mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureCiTool } from './ci-tool.mjs';
import { ciStackContext, stackConfiguration } from './ci-stack-context.mjs';
import { configureAuthPool } from './configure-auth-pool.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
const context = ciStackContext(root, process.env.MARLEVA_STACK_CONTEXT ?? 'ci');
const { folder, project, network } = context;
const supabase = await ensureCiTool('supabase');
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
  writeFileSync(
    folder + '/supabase/config.toml',
    stackConfiguration(readFileSync('infra/ci/supabase/config.toml', 'utf8'), context),
  );
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
  const authPool = await configureAuthPool(context);
  const state = JSON.parse(cli(['status', '--output', 'json']));
  const previous = existsSync(folder + '/.env')
    ? parseEnv(readFileSync(folder + '/.env', 'utf8'))
    : {};
  const env = {
    APP_MODE: 'local',
    PAYMENT_MODE: 'simulated',
    APP_ORIGIN: 'https://localhost:8443',
    SUPABASE_URL: 'http://127.0.0.1:' + context.api,
    SUPABASE_ANON_KEY: state.ANON_KEY,
    SUPABASE_SERVICE_KEY: state.SERVICE_ROLE_KEY,
    TOKEN_ENCRYPTION_KEY: previous.TOKEN_ENCRYPTION_KEY ?? randomBytes(32).toString('hex'),
    BOOTSTRAP_DATABASE_URL: state.DB_URL,
    DATABASE_URL: '',
    MIGRATION_DATABASE_URL: '',
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(context.smtp),
    MAILPIT_URL: 'http://127.0.0.1:' + context.mail,
    MARLEVA_CI_STACK: project === 'marleva-ci' ? '1' : '0',
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
      'supabase_db_' + project,
      'supabase_kong_' + project,
      'supabase_inbucket_' + project,
    ]),
  );
  for (const container of containers)
    for (const ports of Object.values(container.NetworkSettings.Ports))
      for (const port of ports ?? [])
        if (port.HostIp !== '127.0.0.1') throw new Error('Puerto CI expuesto fuera de loopback');
  if (!/^sha256:[a-f0-9]{64}$/.test(containers[0].Image))
    throw new Error('Imagen PostgreSQL CI sin identificador inmutable');
  env.MARLEVA_CI_POSTGRES_IMAGE = containers[0].Image;
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
    folder + '/stack-ready.json',
    JSON.stringify({
      date: new Date().toISOString(),
      project,
      loopbackOnly: true,
      databaseMajor: 17,
      authPool,
    }),
  );
  console.log(
    'Stack CI PG17/Auth/Storage/correo preparado en loopback; credenciales privadas ignoradas.',
  );
} else throw new Error('Uso: ci-stack.mjs start|stop');
