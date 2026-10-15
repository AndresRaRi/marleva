import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
if (process.env.GITHUB_ACTIONS !== 'true' || process.platform !== 'linux')
  throw new Error('La confianza temporal solo se configura en el runner Linux desechable');
function run(binary, args) {
  const result = spawnSync(binary, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Falló preparación de confianza: ${binary}`);
  return result.stdout;
}
run('sudo', ['apt-get', 'update']);
run('sudo', ['apt-get', 'install', '--no-install-recommends', '-y', 'libnss3-tools']);
const database = path.join(homedir(), '.pki/nssdb');
mkdirSync(database, { recursive: true, mode: 0o700 });
if (!existsSync(database + '/cert9.db'))
  run('certutil', ['-N', '-d', 'sql:' + database, '--empty-password']);
run('certutil', [
  '-A',
  '-d',
  'sql:' + database,
  '-n',
  'Marleva temporary CI',
  '-t',
  'C,,',
  '-i',
  path.resolve('artifacts/ci/stack/certs/ca.crt'),
]);
const version = run('dpkg-query', ['-W', '-f=${Version}', 'libnss3-tools']).trim();
writeFileSync(
  'artifacts/ci/nss-tool.json',
  JSON.stringify({
    version,
    source: 'Ubuntu 24.04 oficial',
    license: 'MPL-2.0',
    scope: 'Runner desechable; CA propia, sin ignorar TLS',
  }) + '\n',
);
console.log('CA temporal instalada en NSS del runner; verificación TLS conservada.');
