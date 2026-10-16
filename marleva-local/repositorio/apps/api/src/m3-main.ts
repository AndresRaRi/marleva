import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { CatalogModule } from './modules/m3/catalog.module.js';
import { CatalogErrors } from './modules/m3/presentation/catalog-errors.filter.js';
import { connectM3 } from './modules/m3/infrastructure/prisma-sql.js';
import type { Sql } from './modules/m3/infrastructure/sql.js';
export async function createM3(sql: Sql) {
  const app = await NestFactory.create(CatalogModule.register(sql), { logger: false });
  app.use(helmet());
  app.use(
    (
      _request: unknown,
      response: { setHeader(name: string, value: string): void },
      next: () => void,
    ) => {
      response.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
  app.enableCors({
    origin: ['http://localhost:8103', 'http://127.0.0.1:8103'],
    methods: ['GET'],
    credentials: false,
  });
  app.useGlobalFilters(new CatalogErrors());
  await app.init();
  return app;
}
export async function startM3() {
  const { client, sql } = connectM3();
  await client.$queryRaw`SELECT 1`;
  const app = await createM3(sql);
  await app.listen(3103, '127.0.0.1');
  const stop = async () => {
    await app.close();
    await client.$disconnect();
  };
  process.once('SIGTERM', () => {
    void stop();
  });
  process.once('SIGINT', () => {
    void stop();
  });
  return { app, client };
}
if (process.argv[1]?.endsWith('/m3-main.js')) {
  startM3().catch(() => {
    console.error('No se pudo iniciar M3. Revisa su base aislada.');
    process.exitCode = 1;
  });
}
