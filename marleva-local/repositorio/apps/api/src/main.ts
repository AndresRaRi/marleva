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
import { RateLimitException } from './rate-limit.exception.js';
import { database } from './database.js';
import { AccountService } from './account.service.js';
import { AccountController, HealthController } from './controller.js';
import { startWorker } from './worker.js';
import { config } from './config.js';
import { NotificationsController } from './modules/m1/presentation/controllers/notifications.controller.js';
import { ListNotices } from './modules/m1/application/use-cases/list-notices.js';
import { PrismaNoticeRepository } from './modules/m1/infrastructure/repositories/prisma-notice-repository.js';
import { PrivateFilesController } from './modules/m1/presentation/controllers/private-files.controller.js';
import { PrismaFileRepository } from './modules/m1/infrastructure/repositories/prisma-file-repository.js';
import { LocalPrivateStorage } from './modules/m1/infrastructure/adapters/local-private-storage.js';
import { IssueFileAccess } from './modules/m1/application/use-cases/issue-file-access.js';
import { ReadPrivateFile } from './modules/m1/application/use-cases/read-private-file.js';
import { DeletePrivateFile } from './modules/m1/application/use-cases/delete-private-file.js';
import { MfaRecoveryController } from './modules/m1/presentation/controllers/mfa-recovery.controller.js';
import { PrismaRecoveryRepository } from './modules/m1/infrastructure/repositories/prisma-recovery-repository.js';
import { SupabaseRecoveryProvider } from './modules/m1/infrastructure/adapters/supabase-recovery-provider.js';
import { LocalRecoverySecrets } from './modules/m1/infrastructure/adapters/recovery-secrets.js';
import { RecoveryContext } from './modules/m1/application/use-cases/recovery-context.js';
import { RequestMfaRecovery } from './modules/m1/application/use-cases/request-mfa-recovery.js';
import { ReadMfaRecovery } from './modules/m1/application/use-cases/read-mfa-recovery.js';
import { ReviewMfaRecovery } from './modules/m1/application/use-cases/review-mfa-recovery.js';
import { IssueRecoveryCapability } from './modules/m1/application/use-cases/issue-recovery-capability.js';
import { EnrollRecoveryFactor } from './modules/m1/application/use-cases/enroll-recovery-factor.js';
import { VerifyRecoveryFactor } from './modules/m1/application/use-cases/verify-recovery-factor.js';
import { ProcessMfaRecoveries } from './modules/m1/application/use-cases/process-mfa-recoveries.js';
const db = database();
const recovery = new RecoveryContext(
  new PrismaRecoveryRepository(db),
  new SupabaseRecoveryProvider(),
  new LocalRecoverySecrets(),
);
const files = new PrismaFileRepository(db);
const storage = new LocalPrivateStorage();
@Module({
  controllers: [
    AccountController,
    HealthController,
    NotificationsController,
    PrivateFilesController,
    MfaRecoveryController,
  ],
  providers: [
    { provide: RequestMfaRecovery, useFactory: () => new RequestMfaRecovery(recovery) },
    { provide: ReadMfaRecovery, useFactory: () => new ReadMfaRecovery(recovery) },
    { provide: ReviewMfaRecovery, useFactory: () => new ReviewMfaRecovery(recovery) },
    { provide: IssueRecoveryCapability, useFactory: () => new IssueRecoveryCapability(recovery) },
    { provide: EnrollRecoveryFactor, useFactory: () => new EnrollRecoveryFactor(recovery) },
    { provide: VerifyRecoveryFactor, useFactory: () => new VerifyRecoveryFactor(recovery) },
    { provide: ProcessMfaRecoveries, useFactory: () => new ProcessMfaRecoveries(recovery) },
    { provide: IssueFileAccess, useFactory: () => new IssueFileAccess(files) },
    { provide: ReadPrivateFile, useFactory: () => new ReadPrivateFile(files, storage) },
    { provide: DeletePrivateFile, useFactory: () => new DeletePrivateFile(files) },
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
    if (error instanceof RateLimitException) res.setHeader('Retry-After', String(error.retryAfter));
    else if (status === 429 && !res.hasHeader('Retry-After')) res.setHeader('Retry-After', '60');
    res.status(status).json({
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
  const stop = startWorker(db, app.get(AccountService), app.get(ProcessMfaRecoveries));
  async function close() {
    stop();
    await app.close();
    await db.$disconnect();
  }
  process.on('SIGTERM', () => void close());
  process.on('SIGINT', () => void close());
  console.log('Marleva API local: 127.0.0.1:3000; pagos simulados');
}
