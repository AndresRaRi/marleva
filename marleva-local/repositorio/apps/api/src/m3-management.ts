import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { ManagementModule } from './modules/m3/management.module.js';
import { CatalogErrors } from './modules/m3/presentation/catalog-errors.filter.js';
import { CatalogError, fail } from './modules/m3/domain/catalog.js';
import { uuid } from './modules/m3/presentation/dtos/validation.js';
import type {
  CurrentIdentity,
  IdentityRequest,
  AuthenticatedActor,
} from './modules/m3/application/ports/current-identity.js';
import type { TransactionalSql } from './modules/m3/infrastructure/sql.js';
import type { ManagedRequest } from './modules/m3/presentation/management.controller.js';
import type { Request, Response, NextFunction } from 'express';
const origins = [
  'http://127.0.0.1:8103',
  'http://localhost:8103',
  'http://127.0.0.1:8104',
  'http://localhost:8104',
];
function reject(response: Response, error: unknown) {
  const value =
    error instanceof CatalogError
      ? error
      : new CatalogError(503, 'UNAVAILABLE', 'No pudimos verificar la sesión.');
  response.status(value.status).set('Cache-Control', 'no-store').json({
    codigo: value.code,
    mensaje: value.message,
    request_id: randomUUID(),
    accion_recuperacion: 'Revisa tu sesión o vuelve a intentar.',
  });
}
function validateOrigin(origin: string | undefined) {
  if (origin && !origins.includes(origin)) fail('ORIGIN', 'Este origen no está permitido.', 403);
}
function identityRequest(req: ManagedRequest): IdentityRequest {
  const authorization = req.header('Authorization'),
    cookie = req.header('Cookie');
  const supplied = [authorization, cookie].filter((value): value is string => Boolean(value));
  if (supplied.length !== 1 || supplied[0].length > 4096)
    fail('SESSION', 'Inicia sesión para continuar.', 401);
  const mutation = !['GET', 'HEAD'].includes(req.method),
    origin = req.header('Origin'),
    csrfToken = req.header('x-csrf-token');
  if (cookie && mutation) {
    if (!origin || !csrfToken) fail('CSRF', 'Actualiza la sesión antes de continuar.', 403);
  }
  return { authorization, cookie, origin, csrfToken, mutation };
}
function assignActor(req: ManagedRequest, actor: AuthenticatedActor) {
  if (typeof actor.reviewer !== 'boolean' || typeof actor.mfa !== 'boolean')
    fail('SESSION', 'La sesión no es válida.', 401);
  req.m3csrf = actor.csrfToken;
  req.m3actor = { id: uuid(actor.id), reviewer: actor.reviewer, mfa: actor.mfa };
}
function identityMiddleware(identity: CurrentIdentity) {
  return async (req: ManagedRequest, res: Response, next: NextFunction) => {
    try {
      validateOrigin(req.header('Origin'));
      if (req.method === 'OPTIONS') {
        next();
        return;
      }
      assignActor(req, await identity.resolve(identityRequest(req)));
      next();
    } catch (error) {
      reject(res, error);
    }
  };
}
// Private routes exist only when the host explicitly supplies a current identity adapter.
// No fixture login, identity implementation or private listener is enabled by this module.
export async function createM3Management(sql: TransactionalSql, identity: CurrentIdentity) {
  const app = await NestFactory.create(ManagementModule.register(sql), {
    logger: false,
    bodyParser: false,
  });
  app.use(helmet());
  app.use(identityMiddleware(identity));
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT'],
    allowedHeaders: ['Content-Type', 'Idempotency-Key', 'x-csrf-token', 'Authorization'],
  });
  app.use(express.json({ limit: '64kb', strict: true }));
  app.use(express.raw({ type: ['image/jpeg', 'image/png'], limit: 5000000 }));
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (!error) {
      next();
      return;
    }
    const status = (error as { status?: number }).status;
    reject(
      res,
      new CatalogError(
        status === 413 ? 413 : 400,
        'BODY',
        status === 413
          ? 'El archivo supera el tamaño permitido.'
          : 'Revisa el contenido de la solicitud.',
      ),
    );
  });
  app.useGlobalFilters(new CatalogErrors());
  await app.init();
  return app;
}
