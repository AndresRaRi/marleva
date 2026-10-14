import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './config.js';
export const database = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: config().DATABASE_URL }, { schema: 'marleva' }),
  });
export type Database = ReturnType<typeof database>;
