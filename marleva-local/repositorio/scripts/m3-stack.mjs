import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const name = 'marleva-m3-008',
  volume = name + '-pg',
  network = name + '-local',
  label = 'mx.marleva.module=M3';
const image =
  'public.ecr.aws/supabase/postgres@sha256:06ddc7962e11ab0f4f0334fd05671e97c30ea202f6e6a7113800bd3d6e416108';
function docker(args, optional = false) {
  const result = spawnSync('./scripts/tool', ['docker', ...args], {
    encoding: 'utf8',
    timeout: 30000,
  });
  if (result.status !== 0 && !optional)
    throw Error('Docker M3: ' + args.slice(0, 2).join(' ') + ' falló.');
  return { ok: result.status === 0, text: result.stdout?.trim() ?? '' };
}
function owned() {
  const result = docker(
    ['inspect', '--format', '{{ index .Config.Labels "mx.marleva.module" }}', name],
    true,
  );
  if (result.ok && result.text !== 'M3') throw Error('Contenedor ajeno: operación rechazada.');
  return result.ok;
}
function resource(kind, id) {
  const result = docker(
    [kind, 'inspect', '--format', '{{ index .Labels "mx.marleva.module" }}', id],
    true,
  );
  if (result.ok && result.text !== 'M3') throw Error('Recurso ajeno: operación rechazada.');
  if (!result.ok) docker([kind, 'create', '--label', label, id]);
}
if (process.argv[2] === 'start') {
  if (!owned()) {
    resource('network', network);
    resource('volume', volume);
    docker([
      'run',
      '--pull=never',
      '-d',
      '--name',
      name,
      '--label',
      label,
      '--network',
      network,
      '--memory',
      '512m',
      '--cpus',
      '1',
      '-p',
      '127.0.0.1:55432:5432',
      '-v',
      volume + ':/var/lib/postgresql/data',
      '-e',
      'POSTGRES_PASSWORD=fixture-only',
      '-e',
      'POSTGRES_DB=marleva_m3_008',
      '--entrypoint',
      'docker-entrypoint.sh',
      image,
      'postgres',
      '-c',
      'listen_addresses=0.0.0.0',
    ]);
  } else {
    resource('network', network);
    const networks = JSON.parse(
      docker(['inspect', '--format', '{{json .NetworkSettings.Networks}}', name]).text,
    );
    if (!networks[network]) {
      docker(['network', 'connect', network, name]);
      docker(['stop', name]);
    }
    docker(['start', name]);
  }
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (
      docker(
        [
          'exec',
          name,
          'psql',
          '-h',
          '127.0.0.1',
          '-U',
          'postgres',
          '-d',
          'marleva_m3_008',
          '-Atc',
          'SELECT 1',
        ],
        true,
      ).ok
    ) {
      ready = true;
      break;
    }
    await delay(200);
  }
  if (!ready) throw Error('PostgreSQL M3 no está listo; no aplicar migración.');
  docker([
    'exec',
    name,
    'psql',
    '-h',
    '127.0.0.1',
    '-U',
    'supabase_admin',
    '-d',
    'marleva_m3_008',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    'GRANT CREATE ON DATABASE marleva_m3_008 TO postgres',
  ]);
  docker([
    'exec',
    name,
    'psql',
    '-h',
    '127.0.0.1',
    '-U',
    'postgres',
    '-d',
    'marleva_m3_008',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    'CREATE SCHEMA IF NOT EXISTS m3',
  ]);
  console.log('PostgreSQL M3 listo en 127.0.0.1:55432; origen/M1 intactos.');
} else if (process.argv[2] === 'stop') {
  if (owned()) docker(['stop', name]);
  console.log('Solo contenedor M3 detenido; volumen conservado.');
} else if (process.argv[2] === 'status') {
  if (owned())
    console.log(docker(['inspect', '--format', '{{.State.Status}} {{.Image}}', name]).text);
  else console.log('M3 no creado.');
} else throw Error('Usa start, stop o status. No hay comando de borrado.');
