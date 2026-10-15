import { PrismaClient, Prisma } from './generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Sql, TransactionalSql } from './sql.js';
function assertDestination(url: URL): void {
  if (
    url.protocol !== 'postgresql:' ||
    url.search !== '' ||
    url.hostname !== '127.0.0.1' ||
    url.port !== '55432' ||
    url.pathname !== '/marleva_m3_008'
  )
    throw Error('Destino M3 exclusivo requerido.');
}
export function destination(migration = false): string {
  const value = migration
    ? 'postgresql://postgres:fixture-only@127.0.0.1:55432/marleva_m3_008'
    : (process.env.M3_DATABASE_URL ??
      'postgresql://m3_api:fixture-api-only@127.0.0.1:55432/marleva_m3_008');
  const url = new URL(value);
  assertDestination(url);
  if (!migration && url.username !== 'm3_api')
    throw Error('La API M3 requiere rol de solo lectura.');
  return value;
}
function wrap(client: Prisma.TransactionClient): Sql {
  return {
    query: <T>(sql: string, ...values: unknown[]) => client.$queryRawUnsafe<T[]>(sql, ...values),
    execute: (sql: string, ...values: unknown[]) => client.$executeRawUnsafe(sql, ...values),
  };
}
export function connectM3(migration = false) {
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: destination(migration), max: 5 }, { schema: 'm3' }),
  });
  const sql: TransactionalSql = {
    ...wrap(client),
    transaction: (work) =>
      client.$transaction((tx) => work(wrap(tx)), { maxWait: 5000, timeout: 10000 }),
  };
  return { client, sql };
}
