import { HttpException } from '@nestjs/common';
export class RateLimitException extends HttpException {
  constructor(public readonly retryAfter: number) {
    super(
      {
        codigo: 'ESPERA_CODIGO',
        mensaje: `Espera ${retryAfter} segundos antes de continuar`,
        accion_recuperacion: `Vuelve a intentar en ${retryAfter} segundos`,
      },
      429,
    );
  }
}
