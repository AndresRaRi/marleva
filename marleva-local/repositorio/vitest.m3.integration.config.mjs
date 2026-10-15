import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: [
      'tests/integration/backend/M3/catalog.m3.mjs',
      'tests/integration/frontend/M3/transport.test.ts',
    ],
  },
});
