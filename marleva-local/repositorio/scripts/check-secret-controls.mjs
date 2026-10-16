import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
export function checkSecretControls(binary) {
  const root = path.resolve('artifacts/security/secret-controls');
  const config = path.resolve('infra/ci/gitleaks.toml');
  const profile = 'AaFBim1byffhRH0TlHOJ';
  const fixtures = [
    { name: 'profile', file: 'infra/ci/sonar-cloud.json', key: profile, status: 0 },
    { name: 'other-path', file: 'other.json', key: profile, status: 1 },
    {
      name: 'other-value',
      file: 'infra/ci/sonar-cloud.json',
      key: ['Xy72Jk91', 'Mn63Pq85', 'Rt40Uv'].join(''),
      status: 1,
    },
  ];
  for (const fixture of fixtures) {
    const folder = path.join(root, fixture.name);
    const file = path.join(folder, fixture.file);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `  "key": "${fixture.key}",\n`);
    const result = spawnSync(
      binary,
      ['dir', folder, '--config', config, '--redact', '--no-banner'],
      { encoding: 'utf8' },
    );
    if (result.status !== fixture.status)
      throw new Error(
        `Control detector ${fixture.name}: salida ${result.status}, esperada ${fixture.status}`,
      );
  }
  console.log('Detector de secretos: identificador exacto permitido; otra ruta/valor bloqueados');
}
