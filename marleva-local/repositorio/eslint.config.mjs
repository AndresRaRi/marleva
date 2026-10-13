import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

const typescriptFiles = ['apps/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'];

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
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
    ],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright callbacks execute in the browser; the runner executes in Node.
    files: ['tests/integration/frontend/**/*.mjs', 'tests/performance/frontend/**/*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
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
