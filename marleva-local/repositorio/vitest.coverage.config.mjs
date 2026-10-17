import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.{ts,mjs}'],
    coverage: {
      provider: 'v8',
      include: [
        'apps/api/src/account.service.ts',
        'apps/api/src/security.ts',
        'apps/api/src/readiness.ts',
        'apps/api/src/health.controller.ts',
        'apps/api/src/database.ts',
        'apps/api/src/http-*.ts',
        'apps/api/src/payment-simulator.ts',
        'apps/api/src/modules/m1/domain/**/*.ts',
        'apps/api/src/modules/m1/application/use-cases/**/*.ts',
        'apps/client/src/api.ts',
        'apps/client/src/modules/m1/**/*.ts',
        'apps/client/src/modules/m1/**/*.tsx',
        'apps/client/src/status-messages.tsx',
        'apps/api/src/modules/m1/presentation/dtos/**/*.ts',
        'apps/api/src/modules/m1/infrastructure/adapters/local-private-storage.ts',
        'apps/api/src/modules/m1/infrastructure/adapters/supabase-recovery-provider.ts',
      ],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
