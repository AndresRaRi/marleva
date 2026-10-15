import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fingerprint, introduced } from '../../../../scripts/sonar-policy.mjs';
import { allPages } from '../../../../scripts/sonar-api.mjs';
it('Sonar | inventario igual no introduce incidencias', () => {
  expect(introduced(['regla|archivo|texto'], ['regla|archivo|texto'])).toEqual([]);
});
it('Sonar | nueva incidencia y duplicado adicional bloquean', () => {
  expect(introduced(['a'], ['a', 'a', 'b'])).toEqual(['a', 'b']);
});
it('Sonar | desaparición no compensa otra incidencia nueva', () => {
  expect(introduced(['a', 'a'], ['b'])).toEqual(['b']);
});
it('Sonar | informes inválidos no producen verde', () => {
  expect(() => introduced(null, [])).toThrow();
  expect(() => introduced([], [null])).toThrow();
});
it('Sonar | paginación conserva todas las incidencias', async () => {
  const api = async (_route, { p }) => ({ total: 2, issues: [p === '1' ? 'a' : 'b'] });
  expect(await allPages(api, '/fixture', {}, 'issues')).toEqual(['a', 'b']);
});
it('Sonar | páginas vacías o total cambiante bloquean', async () => {
  await expect(
    allPages(async () => ({ total: 2, issues: [] }), '/fixture', {}, 'issues'),
  ).rejects.toThrow();
  const api = async (_route, { p }) => ({ total: p === '1' ? 2 : 3, issues: ['a'] });
  await expect(allPages(api, '/fixture', {}, 'issues')).rejects.toThrow();
});

it('Sonar | página repetida no sustituye inventario completo', async () => {
  await expect(
    allPages(async () => ({ total: 2, issues: [{ key: 'same' }] }), '/fixture', {}, 'issues'),
  ).rejects.toThrow('duplicado');
});
it('Sonar | desplazar líneas conserva incidencia, cambiar contenido introduce otra', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'marleva-sonar-test-'));
  mkdirSync(path.join(root, 'apps'));
  const file = path.join(root, 'apps/example.ts');
  const issue = { component: 'project:apps/example.ts', rule: 'rule', message: 'message', line: 1 };
  writeFileSync(file, 'const a = 1;\n');
  const base = fingerprint(issue, root, 'project');
  writeFileSync(file, '\nconst a = 1;\n');
  expect(fingerprint({ ...issue, line: 2 }, root, 'project')).toBe(base);
  writeFileSync(file, 'const a = 2;\n');
  expect(introduced([base], [fingerprint(issue, root, 'project')])).toHaveLength(1);
  expect(() => fingerprint({ ...issue, line: 99 }, root, 'project')).toThrow();
  expect(() =>
    fingerprint({ ...issue, component: 'other:apps/example.ts' }, root, 'project'),
  ).toThrow();
});
