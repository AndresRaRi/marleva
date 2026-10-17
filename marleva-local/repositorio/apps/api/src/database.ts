import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './config.js';
export const database = (
  timeouts: { connectionTimeoutMillis?: number; query_timeout?: number } = {},
) =>
  new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: config().DATABASE_URL, ...timeouts },
      { schema: 'marleva' },
    ),
  });
export type Database = ReturnType<typeof database>;
