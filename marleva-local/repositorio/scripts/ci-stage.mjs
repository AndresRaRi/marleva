import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const stages = {
  calidad: ['quality'],
  'arquitectura-contratos': ['arch:check', 'contracts:check'],
  unitarias: ['test:coverage'],
  build: ['build', 'build:container'],
  seguridad: ['security:scan'],
  integracion: ['ci:integration', 'test:recovery:ci'],
  contrato: ['contracts:fuzz'],
  web: ['test:e2e'],
  sonar: ['ci:sonar'],
};
const stage = process.argv[2],
  commands = stages[stage];
if (!commands) throw new Error('Etapa desconocida');
let status = 0,
  failed = '';
for (const command of commands) {
  const run = spawnSync('pnpm', [command], { stdio: 'inherit', env: process.env });
  status = run.status ?? 1;
  if (status) {
    failed = command;
    break;
  }
}
mkdirSync('artifacts/ci', { recursive: true });
writeFileSync(`artifacts/ci/${stage}.json`, JSON.stringify({ stage, status, failed }));
process.exitCode = status;
