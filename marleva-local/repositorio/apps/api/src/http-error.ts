import { HttpException } from '@nestjs/common';
import { RateLimitException } from './rate-limit.exception.js';
import { httpErrorBody } from './http-error-body.js';
export function httpError(error: unknown, requestId: string) {
  const status = error instanceof HttpException ? error.getStatus() : 503;
  const response = error instanceof HttpException ? error.getResponse() : undefined;
  return {
    status,
    retryAfter:
      error instanceof RateLimitException ? error.retryAfter : status === 429 ? 60 : undefined,
    body: httpErrorBody(status, response, requestId),
  };
}
