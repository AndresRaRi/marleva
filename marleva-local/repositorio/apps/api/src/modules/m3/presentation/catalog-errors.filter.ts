import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { CatalogError } from '../domain/catalog.js';
@Catch()
export class CatalogErrors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      error instanceof CatalogError
        ? error.status
        : error instanceof HttpException
          ? error.getStatus()
          : 503;
    const code =
      error instanceof CatalogError ? error.code : status === 503 ? 'UNAVAILABLE' : 'REQUEST';
    const message =
      error instanceof CatalogError
        ? error.message
        : status === 503
          ? 'No pudimos consultar el catálogo.'
          : 'Revisa la solicitud.';
    response.setHeader('Cache-Control', 'no-store');
    response.status(status).json({
      codigo: code,
      mensaje: message,
      request_id: randomUUID(),
      accion_recuperacion:
        status === 503 ? 'Vuelve a intentar.' : 'Revisa los datos o vuelve al catálogo.',
    });
  }
}
