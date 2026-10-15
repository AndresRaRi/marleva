import js from '@eslint/js';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';

const typescriptFiles = ['apps/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'];

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-m3/**',
      '**/build/**',
      '**/.expo/**',
      '**/.gradle/**',
      '**/.cxx/**',
      '**/android/**',
      '**/ios/**',
      'artifacts/**',
      'infra/local/tools/**',
      'infra/local/downloads/**',
      'infra/local/secrets/**',
      'docs/**',
      'tests/results/**',
      'apps/api/src/generated/**',
      'apps/api/src/modules/m3/infrastructure/generated/**',
      'apps/client/src/modules/m3/generated-api.ts',
      'packages/contracts/generated.ts',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
  },
  {
    files: [
      'apps/api/**/*.{js,mjs,cjs,ts}',
      'scripts/*.{mjs,cjs}',
      'tests/**/*.{ts,mjs}',
      'eslint.config.mjs',
      '.dependency-cruiser.cjs',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright callbacks execute in the browser; the runner executes in Node.
    files: ['tests/integration/frontend/**/*.mjs', 'tests/performance/frontend/**/*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
    plugins: { sonarjs: fixupPluginRules(sonarjs) },
    rules: {
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      complexity: ['error', 10],
      'max-depth': ['error', 2],
      'max-lines-per-function': ['warn', { max: 30, skipBlankLines: true, skipComments: true }],
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: typescriptFiles,
  })),
  {
    files: ['apps/client/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, process: 'readonly', __DEV__: 'readonly' },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
];
