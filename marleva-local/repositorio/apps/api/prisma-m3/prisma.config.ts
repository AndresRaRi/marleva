import { defineConfig } from 'prisma/config';
const destination =
  process.env.M3_MIGRATION_URL ??
  'postgresql://postgres:fixture-only@127.0.0.1:55432/marleva_m3_008?schema=m3';
const url = new URL(destination);
if (
  url.protocol !== 'postgresql:' ||
  url.hostname !== '127.0.0.1' ||
  url.port !== '55432' ||
  url.pathname !== '/marleva_m3_008' ||
  url.username !== 'postgres' ||
  url.search !== '?schema=m3'
) {
  throw Error('Migración M3 rechazada: destino exclusivo requerido.');
}
export default defineConfig({
  schema: 'schema.prisma',
  migrations: { path: 'migrations' },
  datasource: { url: destination },
});
