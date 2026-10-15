import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
export function httpPolicy(origin: string) {
  const routes = (
    JSON.parse(
      readFileSync(new URL('../../../packages/config/http-routes.json', import.meta.url), 'utf8'),
    ) as { route: string; methods: string[] }[]
  ).map(({ route, methods }) => ({
    pattern: new RegExp(
      '^' +
        route
          .split('/')
          .map((part) =>
            part.startsWith('{') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          )
          .join('/') +
        '/?$',
    ),
    methods: methods.includes('GET') ? [...methods, 'HEAD'] : methods,
  }));
  return (request: Request, response: Response, next: NextFunction) => {
    const requestId = randomUUID();
    response.setHeader('x-request-id', requestId);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    const known = routes.find((route) => route.pattern.test(request.path));
    const wrongOrigin = request.headers.origin !== undefined && request.headers.origin !== origin;
    const missingOrigin =
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
      request.headers.origin === undefined &&
      request.headers['x-marleva-client'] !== 'native';
    if (wrongOrigin || missingOrigin) {
      response.status(403).json({
        codigo: 'ORIGEN',
        mensaje: 'Acceso no permitido',
        accion_recuperacion: 'Abre Marleva e intenta de nuevo',
        request_id: requestId,
      });
    } else if (known && !known.methods.includes(request.method)) {
      response.setHeader('Allow', known.methods.join(', '));
      response.status(405).json({
        codigo: 'METODO',
        mensaje: 'Esta acción no está disponible',
        accion_recuperacion: 'Usa una acción de Marleva',
        request_id: requestId,
      });
    } else next();
  };
}
