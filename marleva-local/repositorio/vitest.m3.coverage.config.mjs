import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/unit/backend/M3/*.test.mjs', 'tests/unit/frontend/M3/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'apps/api/src/modules/m3/domain/**/*.ts',
        'apps/api/src/modules/m3/application/use-cases/**/*.ts',
        'apps/api/src/modules/m3/presentation/dtos/**/*.ts',
        'apps/client/src/modules/m3/catalog-client.ts',
        'apps/client/src/modules/m3/catalog-store.ts',
      ],
      reportsDirectory: 'coverage/m3',
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
