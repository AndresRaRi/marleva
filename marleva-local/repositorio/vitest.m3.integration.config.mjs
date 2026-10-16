import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    fileParallelism: false,
    include: [
      'tests/integration/backend/M3/*.m3.mjs',
      'tests/integration/frontend/M3/transport.test.ts',
    ],
  },
});
