import { it, expect, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { cloudNegativeFixture } from '../../../../scripts/sonar-cloud-negative.mjs';
import { createCloudNegative } from '../../../../scripts/sonar-cloud-runtime.mjs';
import { command, sourceAreas, sourceFiles } from '../../../../scripts/sonar-runtime.mjs';
import { verifyCloudCoverage } from '../../../../scripts/sonar-cloud-scope.mjs';

it('CI-SONAR-NEG-002 | a fresh issue identity preserves the real S1764 condition', () => {
  const first = cloudNegativeFixture();
  const second = cloudNegativeFixture();
  expect(first.file).toMatch(/^apps\/api\/src\/sonar-negative-[a-f0-9]{32}\.ts$/);
  expect(second.file).not.toBe(first.file);
  const parsed = ts.createSourceFile(first.file, first.content, ts.ScriptTarget.Latest, true);
  expect(parsed.parseDiagnostics).toEqual([]);
  const definition = parsed.statements[0];
  const other = ts.createSourceFile(second.file, second.content, ts.ScriptTarget.Latest, true)
    .statements[0];
  expect(definition.name.text).not.toBe(other.name.text);
  expect(definition.parameters[0].name.text).not.toBe(other.parameters[0].name.text);
  const condition = definition.body.statements[0].expression;
  expect(condition.operatorToken.kind).toBe(ts.SyntaxKind.AmpersandAmpersandToken);
  expect(condition.left.getText(parsed)).toBe(condition.right.getText(parsed));
});

it('CI-SONAR-NEG-002 | the synthetic revision records its fixture only in an isolated repository', () => {
  const originalHead = command('git', ['rev-parse', 'HEAD']).trim();
  const folder = mkdtempSync(path.join(tmpdir(), 'marleva-sonar-negative-'));
  mkdirSync(path.join(folder, 'apps/api/src'), { recursive: true });
  // Hooks export repository-local Git variables; a temporary cwd alone does not isolate Git.
  const localVariables = command('git', ['rev-parse', '--local-env-vars']).trim().split('\n');
  try {
    for (const name of localVariables) vi.stubEnv(name, undefined);
    command('git', ['init', '--quiet', folder]);
    expect(command('git', ['rev-parse', '--show-toplevel'], { cwd: folder }).trim()).toBe(
      realpathSync(folder),
    );
    const result = createCloudNegative(folder);
    expect(result.revision).toMatch(/^[a-f0-9]{40}$/);
    const recorded = command('git', ['show', result.revision + ':' + result.file], { cwd: folder });
    expect(recorded).toBe(readFileSync(path.join(folder, result.file), 'utf8'));
    expect(command('git', ['status', '--porcelain'], { cwd: folder })).toBe('');
  } finally {
    vi.unstubAllEnvs();
  }
  expect(command('git', ['rev-parse', 'HEAD']).trim()).toBe(originalHead);
});

it('CI-SONAR-NEG-002 | scanner inventory covers M3 LCOV and remains compatible with the old baseline', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'marleva-sonar-sources-'));
  for (const area of sourceAreas(folder)) mkdirSync(path.join(folder, area), { recursive: true });
  writeFileSync(path.join(folder, 'apps/api/src/main.ts'), 'export {};');
  writeFileSync(path.join(folder, 'apps/api/src/types.d.ts'), 'export {};');
  expect(sourceAreas(folder)).toHaveLength(3);
  expect(sourceFiles(folder)).toEqual(['apps/api/src/main.ts']);
  mkdirSync(path.join(folder, 'apps/client/m3'));
  writeFileSync(path.join(folder, 'apps/client/m3/App.tsx'), 'export {};');
  expect(sourceAreas(folder)).toContain('apps/client/m3');
  expect(sourceFiles(folder)).toEqual(['apps/api/src/main.ts', 'apps/client/m3/App.tsx']);
});

it.each([
  'WARN Could not resolve 1 file paths in [/repo/coverage/lcov.info]',
  'WARN First unresolved path: apps/client/m3/App.tsx',
])('CI-SONAR-NEG-002 | missing coverage sources block analysis: %s', (log) => {
  expect(() => verifyCloudCoverage(log)).toThrow('Cobertura Cloud');
});
it('CI-SONAR-NEG-002 | resolved coverage is accepted', () => {
  expect(() => verifyCloudCoverage('INFO Analysing [/repo/coverage/lcov.info]')).not.toThrow();
});
