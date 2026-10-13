import 'reflect-metadata';
import {
  Module,
  Catch,
  HttpException,
  type ExceptionFilter,
  type ArgumentsHost,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { database } from './database.js';
import { AccountService } from './account.service.js';
import { AccountController, HealthController } from './controller.js';
import { startWorker } from './worker.js';
import { config } from './config.js';
import { NotificationsController } from './modules/m1/presentation/controllers/notifications.controller.js';
import { ListNotices } from './modules/m1/application/use-cases/list-notices.js';
import { PrismaNoticeRepository } from './modules/m1/infrastructure/repositories/prisma-notice-repository.js';
const db = database();
@Module({
  controllers: [AccountController, HealthController, NotificationsController],
  providers: [
    { provide: AccountService, useFactory: () => new AccountService(db) },
    { provide: ListNotices, useFactory: () => new ListNotices(new PrismaNoticeRepository(db)) },
  ],
})
class AppModule {}
@Catch()
class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = error instanceof HttpException ? error.getStatus() : 503;
    const body =
      error instanceof HttpException
        ? error.getResponse()
        : {
            codigo: 'DEPENDENCIA',
            mensaje: 'Una dependencia local no está disponible',
            accion_recuperacion: 'Intenta de nuevo',
          };
    if (status === 429) res.setHeader('Retry-After', '60');
    res
      .status(status)
      .json({
        ...(typeof body === 'object' ? body : { mensaje: body }),
        request_id: res.getHeader('x-request-id'),
      });
  }
}
export async function makeApp() {
  const c = config(),
    app = await NestFactory.create(AppModule, { logger: false, bodyParser: true });
  app.use(cookieParser());
  app.use(helmet());
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('x-request-id', randomUUID());
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (req.headers.origin && req.headers.origin !== c.APP_ORIGIN) {
      res.status(403).json({ codigo: 'ORIGEN', mensaje: 'Acceso no permitido' });
      return;
    }
    if (
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
      req.headers.origin === undefined &&
      req.headers['x-marleva-client'] !== 'native'
    ) {
      res.status(403).json({ codigo: 'ORIGEN', mensaje: 'Acceso no permitido' });
      return;
    }
    next();
  });
  app.useGlobalFilters(new Errors());
  return app;
}
if (process.env.MARLEVA_TEST !== '1') {
  const app = await makeApp();
  await app.listen(3000, '127.0.0.1');
  const stop = startWorker(db, app.get(AccountService));
  async function close() {
    stop();
    await app.close();
    await db.$disconnect();
  }
  process.on('SIGTERM', () => void close());
  process.on('SIGINT', () => void close());
  console.log('Marleva API local: 127.0.0.1:3000; pagos simulados');
}
