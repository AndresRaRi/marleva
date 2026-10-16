import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ciStackContext, stackConfiguration } from '../../../../scripts/ci-stack-context.mjs';
it('UT113-ISOLATION | bundle adicional separa configuración, puertos y carpetas sin alterar CI', () => {
  const template = readFileSync('infra/ci/supabase/config.toml', 'utf8');
  const ci = ciStackContext('/private/tmp/marleva');
  expect(stackConfiguration(template, ci)).toBe(template);
  const isolated = ciStackContext('/private/tmp/marleva', 'b12-source-006');
  const config = stackConfiguration(template, isolated);
  expect(config).toContain('project_id = "marleva-b12-source-006"');
  expect(config).not.toContain('546');
  for (const port of [54720, 54721, 54722, 54724, 54725]) expect(config).toContain(String(port));
  expect(isolated.folder).not.toBe(ci.folder);
  expect(isolated.network).not.toBe(ci.network);
  for (const unknown of ['', '../ci', 'marleva-m1', 'production'])
    expect(() => ciStackContext('/private/tmp/marleva', unknown)).toThrow();
});
