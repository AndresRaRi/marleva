import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const licenses = [
  ['eslint-plugin-sonarjs', 'e3a994d82e644b03a792a930f574002658412f62407f5fee083f2555c5f23118'],
  ['@eslint/compat', 'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4'],
];
for (const [name, expected] of licenses) {
  const actual = createHash('sha256')
    .update(readFileSync(`node_modules/${name}/LICENSE`))
    .digest('hex');
  assert.equal(actual, expected, `Licencia instalada no verificada: ${name}`);
}

const cases = [
  ['distinct expressions', 'export const compare = (a: number, b: number) => a - b;', null],
  [
    'identical expressions',
    'export const compare = (a: number) => a - a;',
    'sonarjs/no-identical-expressions',
  ],
  [
    'distinct branches',
    'export const choose = (a: boolean) => { if (a) {\n const value = 1;\n return value;\n } else {\n const value = 2;\n return value;\n } };',
    null,
  ],
  [
    'duplicated branches',
    'export const choose = (a: boolean) => { if (a) {\n const value = 1;\n return value;\n } else {\n const value = 1;\n return value;\n } };',
    'sonarjs/no-duplicated-branches',
  ],
];
for (const extension of ['ts', 'tsx']) {
  for (const [name, source, expected] of cases) {
    const result = spawnSync(
      process.execPath,
      [
        'node_modules/eslint/bin/eslint.js',
        '--stdin',
        '--stdin-filename',
        `apps/client/src/lint-control.${extension}`,
        '--format',
        'json',
      ],
      {
        input: extension === 'tsx' ? source + '\nexport const view = <div />;' : source,
        encoding: 'utf8',
        timeout: 30000,
      },
    );
    assert.ifError(result.error);
    assert.equal(
      result.status,
      expected ? 1 : 0,
      `${name}/${extension}: ${result.stderr || result.stdout}`,
    );
    const [report] = JSON.parse(result.stdout);
    assert.equal(report.fatalErrorCount, 0);
    assert.deepEqual(
      report.messages.map((message) => message.ruleId),
      expected ? [expected] : [],
    );
  }
}
console.log('Controles lint: 8 casos TS/TSX correctos; ambas reglas bloquean mediante CLI real.');
