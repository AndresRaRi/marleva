import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { readFileSync } from 'node:fs';
const version = readFileSync('infra/ci/.python-version', 'utf8').trim();
const python = process.env.MARLEVA_PYTHON_BIN ?? 'python3';
const check = spawnSync(python, ['--version'], { encoding: 'utf8' });
if (check.status !== 0 || check.stdout.trim() !== `Python ${version}`)
  throw new Error(`Python ${version} requerido; configurar MARLEVA_PYTHON_BIN`);
const folder = path.resolve('infra/local/tools/ci/schemathesis');
process.env.SCHEMATHESIS_HOOKS = 'schemathesis_hooks';
process.env.PYTHONPATH = path.resolve('infra/ci');
function run(binary, args) {
  const result = spawnSync(binary, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) throw new Error(`Falló ${path.basename(binary)} ${args[0]}`);
}
run(python, ['-m', 'venv', folder]);
run(folder + '/bin/python', [
  '-m',
  'pip',
  'install',
  '--require-hashes',
  '-r',
  'infra/ci/requirements.lock',
]);
run(folder + '/bin/schemathesis', [
  'run',
  'docs/apis/M1/openapi.yaml',
  '--url',
  'http://127.0.0.1:3000',
  '--header',
  'x-marleva-client:native',
  '--checks',
  'all',
  '--workers',
  '1',
  '--max-time',
  '120',
  '--rate-limit',
  'auto',
  '--report',
  'junit',
  '--report-dir',
  'artifacts/ci/schemathesis',
]);
