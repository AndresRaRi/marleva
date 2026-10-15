import { Catch, type ExceptionFilter, type ArgumentsHost } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { httpError } from './http-error.js';
@Catch()
export class HttpErrors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const reference = response.getHeader('x-request-id');
    const result = httpError(error, typeof reference === 'string' ? reference : randomUUID());
    response.setHeader('x-request-id', result.body.request_id);
    response.setHeader('Cache-Control', 'no-store');
    if (result.retryAfter !== undefined)
      response.setHeader('Retry-After', String(result.retryAfter));
    response.status(result.status).json(result.body);
  }
}
