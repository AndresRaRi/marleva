import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { assertDeploymentDisabled } from '../../../../scripts/ci-deployment-policy.mjs';
const current = () =>
  parse(
    readFileSync(new URL('../../../../../../.github/workflows/cd.yml', import.meta.url), 'utf8'),
  );
it('CI-CD-001 | borrador real no ejecuta ni publica', () =>
  expect(() => assertDeploymentDisabled(current())).not.toThrow());
it.each(['${{ true }}', true, undefined])(
  'CI-CD-002 | activar o retirar bloqueo %s se rechaza',
  (condition) => {
    const workflow = current();
    workflow.jobs['despliegue-desactivado'].if = condition;
    expect(() => assertDeploymentDisabled(workflow)).toThrow();
  },
);
it.each(['push', 'schedule', 'pull_request'])(
  'CI-CD-003 | evento automático %s se rechaza',
  (event) => {
    const workflow = current();
    workflow.on[event] = {};
    expect(() => assertDeploymentDisabled(workflow)).toThrow();
  },
);
it('CI-CD-004 | paso de publicación añadido se rechaza aunque el borrador esté bloqueado', () => {
  const workflow = current();
  workflow.jobs['despliegue-desactivado'].steps.push({ run: 'docker push fixture.invalid/app' });
  expect(() => assertDeploymentDisabled(workflow)).toThrow();
});
