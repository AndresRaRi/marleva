import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
assert.equal(process.env.MARLEVA_RECOVERY_CHECK, '1');
process.loadEnvFile(new URL('../../.env', import.meta.url));
assert.equal(process.env.APP_MODE, 'local');
const root = process.cwd(),
  copy = JSON.parse(readFileSync('tests/results/recovery-copy.json', 'utf8'));
const names = copy.names,
  run = names.prefix.slice('marleva-b12-'.length);
assert.match(run, /^\d{13}$/);
assert.equal(names.prefix, 'marleva-b12-' + run);
const folder = 'artifacts/recovery/' + names.prefix + '/provider';
mkdirSync(folder, { recursive: true, mode: 0o700 });
chmodSync(folder, 0o700);
const keys = JSON.parse(readFileSync('artifacts/recovery/target-keys/keys.private.json', 'utf8'));
const docker = (args, input) => {
  try {
    return execFileSync('docker', args, {
      input,
      encoding: 'utf8',
      timeout: 60000,
      maxBuffer: 20000000,
    });
  } catch (error) {
    writeFileSync(folder + '/docker-failure.private.log', String(error), { mode: 0o600 });
    for (const field of Object.keys(error)) if (field !== 'status') delete error[field];
    error.message = 'Docker terminó con código ' + String(error.status ?? 'desconocido');
    error.stack = 'Error: ' + error.message + '; detalle conservado en archivo privado';
    delete error.cause;
    throw new Error(
      'Operación Docker del destino falló; detalle privado, no mostrar credenciales',
      {
        cause: error,
      },
    );
  }
};
const inspect = (name) => JSON.parse(docker(['inspect', name]))[0];
const envOf = (c) =>
  Object.fromEntries(
    c.Config.Env.map((e) => {
      const i = e.indexOf('=');
      return [e.slice(0, i), e.slice(i + 1)];
    }),
  );
const old = inspect(names.db);
assert.equal(old.State.Running, false);
assert.equal(old.Config.Labels['marleva.b12.run'], run);
assert.equal(old.Mounts[0].Name, names.pgTarget);
const network = JSON.parse(docker(['network', 'inspect', names.network]))[0];
assert.equal(network.Internal, true);
assert.equal(network.Labels['marleva.b12.run'], run);
const accessNetwork = names.prefix + '-host-access';
const accessExisting = spawnSync('docker', ['network', 'inspect', accessNetwork], {
  encoding: 'utf8',
});
if (accessExisting.status !== 0)
  docker([
    'network',
    'create',
    '--label',
    'marleva.b12.run=' + run,
    '-o',
    'com.docker.network.bridge.host_binding_ipv4=127.0.0.1',
    '-o',
    'com.docker.network.bridge.enable_ip_masquerade=false',
    accessNetwork,
  ]);
const accessInfo = JSON.parse(docker(['network', 'inspect', accessNetwork]))[0];
assert.equal(accessInfo.Labels['marleva.b12.run'], run);
assert.equal(accessInfo.Options['com.docker.network.bridge.host_binding_ipv4'], '127.0.0.1');
assert.equal(accessInfo.Options['com.docker.network.bridge.enable_ip_masquerade'], 'false');
const originals = Object.fromEntries(
  ['db', 'auth', 'storage', 'kong', 'inbucket'].map((s) => {
    const name = 'supabase_' + s + '_marleva-m1',
      value = inspect(name);
    assert.equal(value.Image, copy.sourceImages.find((i) => i.name === '/' + name).image);
    return [s, value];
  }),
);
const targetNames = Object.fromEntries(
  Object.keys(originals).map((s) => [s, names.prefix + '-' + s + '-provider']),
);
const created = [];
// Reuse only stopped containers created by this exact run; volumes remain intact.
for (const name of Object.values(targetNames)) {
  const found = spawnSync('docker', ['inspect', name], { encoding: 'utf8' });
  if (found.status === 0) {
    const existing = JSON.parse(found.stdout)[0];
    assert.equal(existing.State.Running, false);
    assert.equal(existing.Config.Labels['marleva.b12.run'], run);
    assert.ok(
      existing.Mounts.every(
        (m) => !['supabase_db_marleva-m1', 'supabase_storage_marleva-m1'].includes(m.Name),
      ),
    );
    docker(['rm', name]);
  }
}
const sourceUrl = new URL(process.env.DATABASE_URL),
  businessRole = decodeURIComponent(sourceUrl.username);
assert.match(businessRole, /^[a-z][a-z0-9_]*$/);
const passwords = Object.fromEntries(
  ['postgres', 'supabase_auth_admin', 'supabase_storage_admin', businessRole].map((role) => [
    role,
    randomBytes(24).toString('hex'),
  ]),
);
const dbEnv = envOf(originals.db);
dbEnv.POSTGRES_PASSWORD = passwords.postgres;
dbEnv.JWT_SECRET = keys.jwtSecret;
function envFile(service, env) {
  const file = folder + '/' + service + '.env';
  writeFileSync(
    file,
    Object.entries(env)
      .map(([k, v]) => k + '=' + v)
      .join('\n') + '\n',
    { mode: 0o600 },
  );
  return file;
}
function start(service, env, mounts = [], ports = [], command) {
  const source = originals[service],
    name = targetNames[service];
  const args = [
    'create',
    '--pull=never',
    '--name',
    name,
    '--label',
    'marleva.b12.run=' + run,
    '--network',
    names.network,
    '--network-alias',
    source.Name.slice(1),
    '--memory',
    service === 'db' ? '768m' : '256m',
    '--cpus',
    service === 'db' ? '1' : '0.5',
    '--env-file',
    envFile(service, env),
  ];
  for (const mount of mounts) args.push('--mount', mount);
  for (const [host, inside] of ports) args.push('-p', `127.0.0.1:${host}:${inside}`);
  const entry = service === 'db' ? ['docker-entrypoint.sh'] : source.Config.Entrypoint;
  if (entry?.length) {
    assert.equal(entry.length, 1);
    args.push('--entrypoint', entry[0]);
  }
  args.push(source.Image, ...(command ?? source.Config.Cmd ?? []));
  docker(args);
  created.push(name);
  if (['db', 'kong', 'inbucket'].includes(service))
    docker(['network', 'connect', accessNetwork, name]);
  if (service === 'kong') {
    const archive = execFileSync(
      'tar',
      [
        '--no-xattrs',
        '--no-acls',
        '--no-fflags',
        '--uid',
        gatewayUid,
        '--gid',
        gatewayGid,
        '-cf',
        '-',
        '-C',
        folder,
        'kong.yml',
        'localhost.crt',
        'localhost.key',
      ],
      { env: { ...process.env, COPYFILE_DISABLE: '1' } },
    );
    docker(['cp', '-a', '-', name + ':/home/kong'], archive);
  }
  docker(['start', name]);
}
async function waitDb() {
  for (let i = 0; i < 120; i++) {
    const ready = spawnSync(
      'docker',
      ['exec', targetNames.db, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres'],
      { encoding: 'utf8' },
    );
    if (ready.status === 0) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('PG del destino no listo');
}
function dbUrl(value) {
  const u = new URL(value);
  const role = decodeURIComponent(u.username);
  assert.ok(passwords[role], 'Rol del destino no identificado');
  u.hostname = targetNames.db;
  u.password = passwords[role];
  return u.toString();
}
const authEnv = envOf(originals.auth);
authEnv.GOTRUE_DB_DATABASE_URL = dbUrl(authEnv.GOTRUE_DB_DATABASE_URL);
authEnv.GOTRUE_JWT_SECRET = keys.jwtSecret;
authEnv.GOTRUE_JWT_KEYS = JSON.stringify(keys.authKeys);
authEnv.GOTRUE_JWT_ISSUER = 'http://127.0.0.1:54421/auth/v1';
authEnv.API_EXTERNAL_URL = 'http://127.0.0.1:54421';
const storageEnv = envOf(originals.storage);
for (const field of ['DATABASE_URL', 'VECTOR_DATABASE_URL'])
  if (storageEnv[field]) storageEnv[field] = dbUrl(storageEnv[field]);
storageEnv.AUTH_JWT_SECRET = keys.jwtSecret;
storageEnv.JWT_JWKS = JSON.stringify(keys.jwks);
storageEnv.ANON_KEY = keys.anon;
storageEnv.SERVICE_KEY = keys.service;
storageEnv.S3_PROTOCOL_ACCESS_KEY_ID = randomBytes(16).toString('hex');
storageEnv.S3_PROTOCOL_ACCESS_KEY_SECRET = randomBytes(24).toString('hex');
const originalGateway = originals.kong.Config.Cmd;
const gatewayEnv = envOf(originals.kong);
const gatewayBody = docker([
  'exec',
  originals.kong.Name.slice(1),
  'cat',
  gatewayEnv.KONG_DECLARATIVE_CONFIG,
]);
assert.ok(
  gatewayBody.includes(process.env.SUPABASE_ANON_KEY),
  'Clave anon del gateway no coincide con el origen identificado',
);
assert.ok(
  gatewayBody.includes(process.env.SUPABASE_SERVICE_KEY),
  'Clave service del gateway no coincide con el origen identificado',
);
const gatewayCommand = originalGateway;
writeFileSync(
  folder + '/kong.yml',
  gatewayBody
    .replaceAll(process.env.SUPABASE_ANON_KEY, keys.anon)
    .replaceAll(process.env.SUPABASE_SERVICE_KEY, keys.service),
  { mode: 0o600 },
);
const gatewayUid = docker(['exec', originals.kong.Name.slice(1), 'id', '-u']).trim();
const gatewayGid = docker(['exec', originals.kong.Name.slice(1), 'id', '-g']).trim();
assert.match(gatewayUid, /^\d+$/);
assert.match(gatewayGid, /^\d+$/);
execFileSync(
  'openssl',
  [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    folder + '/localhost.key',
    '-out',
    folder + '/localhost.crt',
    '-subj',
    '/CN=localhost',
    '-days',
    '1',
  ],
  { stdio: 'ignore', timeout: 20000 },
);
chmodSync(folder + '/localhost.key', 0o600);
chmodSync(folder + '/localhost.crt', 0o600);
gatewayEnv.KONG_PORT_MAPS = gatewayEnv.KONG_PORT_MAPS?.replaceAll('54321', '54421') ?? '54421:8000';
const gatewayMounts = originals.kong.Mounts.map((m) => {
  assert.equal(m.Type, 'bind');
  assert.ok(
    path.resolve(m.Source).startsWith(root + '/infra/local/supabase/templates/'),
    'Template fuera del proyecto',
  );
  return `type=bind,src=${m.Source},dst=${m.Destination},readonly`;
});
const config = {
  names: targetNames,
  network: names.network,
  accessNetwork,
  run,
  ports: { gateway: 54421, db: 54422, mailpit: 54424, smtp: 54425, api: 3001 },
  copyPrefix: names.prefix,
};
try {
  start(
    'db',
    dbEnv,
    [`type=volume,src=${names.pgTarget},dst=/var/lib/postgresql/data`],
    [[54422, 5432]],
    ['postgres', '-D', '/etc/postgresql', '-c', 'listen_addresses=0.0.0.0'],
  );
  await waitDb();
  const statements = Object.entries(passwords)
    .map(([role, password]) => `ALTER ROLE "${role}" PASSWORD '${password}';`)
    .join('\n');
  docker(
    [
      'exec',
      '-i',
      targetNames.db,
      'psql',
      '-U',
      'supabase_admin',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    statements,
  );
  start(
    'inbucket',
    envOf(originals.inbucket),
    [],
    [
      [54424, 8025],
      [54425, 1025],
    ],
  );
  start('auth', authEnv);
  start('storage', storageEnv, [`type=volume,src=${names.storageTarget},dst=/mnt`]);
  start('kong', gatewayEnv, gatewayMounts, [[54421, 8000]], gatewayCommand);
  const apiUrl = new URL(process.env.DATABASE_URL);
  apiUrl.hostname = '127.0.0.1';
  apiUrl.port = '54422';
  apiUrl.password = passwords[businessRole];
  config.environment = {
    ...Object.fromEntries(
      [
        'APP_MODE',
        'PAYMENT_MODE',
        'APP_ORIGIN',
        'TOKEN_ENCRYPTION_KEY',
        'SMTP_HOST',
        'SMTP_PORT',
      ].map((k) => [k, process.env[k]]),
    ),
    SUPABASE_URL: 'http://127.0.0.1:54421',
    SUPABASE_ANON_KEY: keys.anon,
    SUPABASE_SERVICE_KEY: keys.service,
    DATABASE_URL: apiUrl.toString(),
    MAILPIT_URL: 'http://127.0.0.1:54424',
    MARLEVA_TEST: '1',
  };
  writeFileSync(folder + '/stack.private.json', JSON.stringify(config, null, 2), { mode: 0o600 });
  let ready = false;
  for (let i = 0; i < 120; i++) {
    try {
      const response = await fetch('http://127.0.0.1:54421/auth/v1/health', {
        headers: { apikey: keys.anon },
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* Gateway is still starting; bounded retry. */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(ready, 'Auth/gateway del destino no listo');
  let storageReady = false;
  for (let i = 0; i < 120; i++) {
    try {
      const status = await fetch('http://127.0.0.1:54421/storage/v1/status', {
        headers: { apikey: keys.anon },
        signal: AbortSignal.timeout(1000),
      });
      if (status.ok) {
        storageReady = true;
        break;
      }
    } catch {
      /* Storage is still starting; bounded retry. */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(storageReady, 'Storage del destino no listo');
  writeFileSync(
    'tests/results/recovery-stack.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        names: targetNames,
        network: names.network,
        ports: config.ports,
        obtained:
          'PG/Auth/Storage/gateway/capturador separados; claves nuevas; sin API Marleva todavía',
        limits: 'Reaplicación/revocación/permisos en destino aún no comprobados',
      },
      null,
      2,
    ) + '\n',
  );
  console.log('B12: proveedor del destino activo y separado; API Marleva aún cerrada');
} catch (error) {
  for (const name of created.reverse())
    spawnSync('docker', ['stop', '--time', '10', name], { encoding: 'utf8' });
  writeFileSync(
    'tests/results/recovery-stack-failure.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        message: error.message,
        created,
        limits: 'No proveedor recuperado acreditado; origen intacto',
      },
      null,
      2,
    ) + '\n',
  );
  throw error;
}
