import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
const baseline = JSON.parse(readFileSync('tests/coverage-baseline.json', 'utf8'));
const current = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8')).total;
for (const metric of ['lines', 'statements', 'branches', 'functions']) {
  const minimum = baseline.total[metric];
  if (!Number.isFinite(minimum) || minimum < 80 || minimum > 100)
    throw new Error(`Línea base inválida: ${metric}`);
  if (current[metric].pct < minimum)
    throw new Error(`Cobertura ${metric}: ${current[metric].pct}% baja de ${minimum}%`);
}

const lcov = ['coverage/lcov.info', ...(process.env.MARLEVA_COVERAGE_EXTRA?.split(',') ?? [])]
  .filter(Boolean)
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const lines = new Map();
let file;
for (const line of lcov.split('\n')) {
  if (line.startsWith('SF:')) {
    file = line.slice(3).replaceAll('\\', '/');
    if (!lines.has(file)) lines.set(file, new Map());
  }
  if (line.startsWith('DA:')) {
    const [number, count] = line.slice(3).split(',').map(Number);
    lines.get(file).set(number, Math.max(count, lines.get(file).get(number) ?? 0));
  }
}
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const base =
  process.env.MARLEVA_COVERAGE_BASE ??
  (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : baseline.base);
const previous = execFileSync('git', ['ls-tree', base, '--', 'tests/coverage-baseline.json'], {
  encoding: 'utf8',
}).trim();
if (previous) {
  const raw = execFileSync(
    'git',
    ['show', `${base}:marleva-local/repositorio/tests/coverage-baseline.json`],
    { encoding: 'utf8' },
  );
  const stored = JSON.parse(raw);
  for (const [metric, minimum] of Object.entries(stored.total))
    if (baseline.total[metric] < minimum) throw new Error(`La línea base ${metric} no puede bajar`);
}
const diff = execFileSync(
  'git',
  ['diff', '--unified=0', base, '--', 'apps/**/*.ts', 'apps/**/*.tsx'],
  { encoding: 'utf8' },
);
const noRuntime = new Set();
let cursor = 0,
  covered = 0,
  total = 0;
for (const line of diff.split('\n')) {
  if (line.startsWith('+++ b/')) {
    file = line.slice(6).replace('marleva-local/repositorio/', '');
    // Generated OpenAPI declarations are regenerated and diff-checked in the required M3 job.
    if (file === 'apps/client/src/modules/m3/generated/api.ts') noRuntime.add(file);
    else {
      const output = ts.transpileModule(readFileSync(file, 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
      }).outputText;
      if (/^\s*(?:export\s*\{\s*\};?\s*)?$/u.test(output)) noRuntime.add(file);
    }
  } else if (line.startsWith('@@')) cursor = Number(line.match(/\+(\d+)/)[1]);
  else if (line.startsWith('+')) {
    if (noRuntime.has(file)) {
      cursor++;
      continue;
    }
    const counts = lines.get(file) ?? lines.get(`${root}/marleva-local/repositorio/${file}`);
    const count = counts?.get(cursor);
    // Count executable lines from LCOV; unknown source lines remain uncovered.
    if (
      count !== undefined ||
      (!counts &&
        !/^\s*(?:$|import\b|export type\b|type\b|interface\b|\/\/|[{}();,<>]+\s*$)/.test(
          line.slice(1),
        ))
    ) {
      total++;
      if (count > 0) covered++;
    }
    cursor++;
  } else if (line.startsWith(' ') && !line.startsWith('---')) cursor++;
}
const percent = total ? (covered / total) * 100 : 100;
console.log(
  `Cobertura total preservada. Líneas nuevas: ${covered}/${total} = ${percent.toFixed(2)}%.`,
);
if (percent < 80)
  throw new Error(
    'El código nuevo requiere al menos 80% de cobertura; ampliar pruebas, sin excluir lógica.',
  );
