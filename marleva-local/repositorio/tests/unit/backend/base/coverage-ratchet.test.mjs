import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
// These cases create real Git histories and launch Node; this is orchestration, not an application latency target.
const cliTestTimeout = 30000;
const gate = resolve('scripts/coverage-ratchet.mjs');
function scenario(source, { hit = 0, extra = false, typeOnly = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'marleva-coverage-test-'));
  const cwd = join(root, 'marleva-local/repositorio');
  mkdirSync(cwd, { recursive: true });
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
  );
  const git = (...args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', env, timeout: 10000 }).trim();
  try {
    git('init', '--quiet', root);
    git('config', 'user.name', 'Fixture');
    git('config', 'user.email', 'fixture@example.invalid');
    mkdirSync(join(cwd, 'tests'));
    writeFileSync(
      join(cwd, 'tests/coverage-baseline.json'),
      JSON.stringify({
        base: 'HEAD',
        total: { lines: 80, statements: 80, branches: 80, functions: 80 },
      }),
    );
    git('add', '.');
    git('commit', '--quiet', '-m', 'fixture base');
    const base = git('rev-parse', 'HEAD');
    mkdirSync(join(cwd, 'apps/api'), { recursive: true });
    writeFileSync(join(cwd, 'apps/api/example.ts'), source);
    mkdirSync(join(cwd, 'coverage'));
    writeFileSync(
      join(cwd, 'coverage/coverage-summary.json'),
      JSON.stringify({
        total: Object.fromEntries(
          ['lines', 'statements', 'branches', 'functions'].map((x) => [x, { pct: 100 }]),
        ),
      }),
    );
    writeFileSync(
      join(cwd, 'coverage/lcov.info'),
      typeOnly ? '' : `SF:apps/api/example.ts\nDA:1,${hit}\nend_of_record\n`,
    );
    if (extra)
      writeFileSync(
        join(cwd, 'coverage/extra.info'),
        'SF:apps/api/example.ts\nDA:1,1\nend_of_record\n',
      );
    git('add', '.');
    git('commit', '--quiet', '-m', 'fixture increment');
    const result = spawnSync(process.execPath, [gate], {
      cwd,
      encoding: 'utf8',
      timeout: 10000,
      env: {
        ...env,
        MARLEVA_COVERAGE_BASE: base,
        MARLEVA_COVERAGE_EXTRA: extra ? 'coverage/extra.info' : '',
      },
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBeTypeOf('number');
    return result;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
it(
  'CI coverage | una línea ejecutable sin hits bloquea, y con hits pasa',
  () => {
    expect(scenario('export const calculate = () => 42;\n').status).not.toBe(0);
    expect(scenario('export const calculate = () => 42;\n', { hit: 1 }).status).toBe(0);
  },
  cliTestTimeout,
);
it(
  'CI coverage | combinar reportes conserva el hit positivo de la misma línea',
  () => {
    expect(scenario('export const calculate = () => 42;\n', { extra: true }).status).toBe(0);
  },
  cliTestTimeout,
);
it(
  'CI coverage | tipos puros no ejecutan; lógica nueva sin LCOV sigue bloqueada',
  () => {
    expect(scenario('export interface OnlyType { id: string }\n', { typeOnly: true }).status).toBe(
      0,
    );
    expect(scenario('export const calculate = () => 42;\n', { typeOnly: true }).status).not.toBe(0);
  },
  cliTestTimeout,
);
