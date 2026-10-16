import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
export function assertDeploymentDisabled(workflow) {
  assert.deepEqual(
    Object.keys(workflow.on),
    ['workflow_dispatch'],
    'CD solo admite disparo manual',
  );
  assert.deepEqual(workflow.permissions, { contents: 'read' }, 'CD sin permisos de escritura');
  const jobs = Object.values(workflow.jobs);
  assert.equal(jobs.length, 1, 'CD conserva un único borrador bloqueado');
  assert.equal(jobs[0].if, '${{ false }}', 'Despliegue requiere autorización material nueva');
  assert.equal(jobs[0].environment, undefined, 'Sin ambiente de despliegue');
  assert.equal(jobs[0].secrets, undefined, 'Sin secretos de despliegue');
  assert.deepEqual(jobs[0].steps, [
    { run: "echo 'Sin despliegue autorizado; borrador inactivo.'" },
  ]);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const workflow = parse(
    readFileSync(new URL('../../../.github/workflows/cd.yml', import.meta.url), 'utf8'),
  );
  assertDeploymentDisabled(workflow);
  console.log('CD: borrador manual bloqueado, sin despliegue.');
}
