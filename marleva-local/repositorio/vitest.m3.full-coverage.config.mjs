import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
export default defineConfig({
  resolve: { alias: { 'react-native': resolve('apps/client/node_modules/react-native-web') } },
  test: {
    fileParallelism: false,
    include: [
      'tests/unit/backend/M3/*.test.mjs',
      'tests/unit/frontend/M3/*.test.ts',
      'tests/integration/backend/M3/*.m3.mjs',
      'tests/integration/frontend/M3/transport.test.ts',
      'tests/integration/frontend/M3/render.test.mjs',
      'tests/integration/frontend/M3/*.render.test.mjs',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'apps/api/src/modules/m3/**/*.ts',
        'apps/api/dist-m3/modules/m3/**/*.js',
        'apps/api/dist-m3/m3-main.js',
        'apps/api/src/m3-main.ts',
        'apps/api/src/m3-management.ts',
        'apps/api/dist-m3/m3-management.js',
        'apps/client/src/modules/m3/**/*.{ts,tsx}',
        'apps/client/m3/App.tsx',
      ],
      exclude: ['**/generated/**'],
      reportsDirectory: 'coverage/m3-full',
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { lines: 80, statements: 80, branches: 80, functions: 80 },
    },
  },
});
