import { it, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ pg: vi.fn(), prisma: vi.fn() }));
vi.mock('../../../../apps/api/src/config.js', () => ({
  config: () => ({ DATABASE_URL: 'postgresql://fixture@127.0.0.1:54622/postgres' }),
}));
vi.mock('../../../../apps/api/node_modules/@prisma/adapter-pg/dist/index.mjs', () => ({
  PrismaPg: class {
    constructor(...args) {
      mocks.pg(...args);
    }
  },
}));
vi.mock('../../../../apps/api/src/generated/prisma/client.js', () => ({
  PrismaClient: class {
    constructor(value) {
      mocks.prisma(value);
    }
  },
}));
import { database } from '../../../../apps/api/src/database';
it.each([undefined, { connectionTimeoutMillis: 3000, query_timeout: 3000 }])(
  'MAR-M1-UT-BE-110-DB-FACTORY | opciones de salud sin alterar conexión normal %j',
  (timeouts) => {
    mocks.pg.mockClear();
    mocks.prisma.mockClear();
    const client = database(timeouts);
    expect(client).toBeDefined();
    expect(mocks.pg).toHaveBeenCalledWith(
      { connectionString: 'postgresql://fixture@127.0.0.1:54622/postgres', ...timeouts },
      { schema: 'marleva' },
    );
    expect(mocks.prisma).toHaveBeenCalledWith({ adapter: expect.any(Object) });
  },
);
