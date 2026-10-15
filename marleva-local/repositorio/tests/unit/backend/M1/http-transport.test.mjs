import { it, expect, vi } from 'vitest';
import { createRequire } from 'node:module';
const { HttpException, BadRequestException, NotFoundException } = createRequire(
  new URL('../../../../apps/api/package.json', import.meta.url),
)('@nestjs/common');
import { httpError } from '../../../../apps/api/src/http-error.ts';
import { HttpErrors } from '../../../../apps/api/src/http-errors.filter.ts';
import { httpPolicy } from '../../../../apps/api/src/http-policy.ts';
import { RateLimitException } from '../../../../apps/api/src/rate-limit.exception.ts';
import { accountRequest } from '../../../../apps/api/src/modules/m1/presentation/dtos/account-request.ts';
const reference = '11111111-1111-4111-8111-111111111111';
function response() {
  const headers = new Map();
  const result = {
    setHeader: (key, value) => headers.set(key, value),
    getHeader: (key) => headers.get(key),
    status: vi.fn(),
    json: vi.fn(),
    headers,
  };
  result.status.mockReturnValue(result);
  return result;
}
it.each([
  new BadRequestException('payload sensible'),
  new NotFoundException('ruta sensible'),
  new HttpException('mensaje sensible', 403),
  new HttpException({ codigo: 42, mensaje: null, accion_recuperacion: [] }, 422),
])(
  'MAR-M1-UT-BE-110-HTTP-A | errores de transporte no reflejan payloads y conservan contrato',
  (error) => {
    const result = httpError(error, reference);
    expect(result.status).toBe(error.getStatus());
    expect(result.body).toEqual({
      codigo: 'SOLICITUD',
      mensaje: 'Revisa la solicitud e intenta de nuevo',
      accion_recuperacion: 'Intenta de nuevo o solicita ayuda',
      request_id: reference,
    });
  },
);
it('MAR-M1-UT-BE-110-HTTP-B | fallos inesperados no filtran SQL y los errores de negocio conservan su mensaje', () => {
  expect(httpError(new Error('SQL/password privado'), reference).body.codigo).toBe('DEPENDENCIA');
  const body = {
    codigo: 'SESION',
    mensaje: 'Vuelve a entrar',
    accion_recuperacion: 'Pide un código',
    interno: 'no publicar',
  };
  expect(httpError(new HttpException(body, 401), reference).body).toEqual({
    codigo: 'SESION',
    mensaje: 'Vuelve a entrar',
    accion_recuperacion: 'Pide un código',
    request_id: reference,
  });
});
it('MAR-M1-UT-BE-110-HTTP-C | filtro registra referencia/no-store y respeta la espera real', () => {
  for (const [error, wait] of [
    [new RateLimitException(217), 217],
    [new HttpException({}, 429), 60],
    [new BadRequestException(), undefined],
  ]) {
    const res = response();
    res.setHeader('x-request-id', reference);
    new HttpErrors().catch(error, { switchToHttp: () => ({ getResponse: () => res }) });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('Retry-After')).toBe(wait === undefined ? undefined : String(wait));
    expect(res.json.mock.calls[0][0].request_id).toBe(reference);
  }
  const res = response();
  new HttpErrors().catch(null, { switchToHttp: () => ({ getResponse: () => res }) });
  expect(res.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
  expect(res.status).toHaveBeenCalledWith(503);
});
it.each([
  ['GET', '/v1/me', {}, undefined],
  ['HEAD', '/v1/me', {}, undefined],
  ['POST', '/v1/auth/challenges', { 'x-marleva-client': 'native' }, undefined],
  ['POST', '/v1/auth/challenges', { origin: 'https://localhost:8443' }, undefined],
  ['POST', '/v1/auth/challenges', {}, 403],
  ['GET', '/v1/me', { origin: 'https://evil.example' }, 403],
  ['GET', '/v1/me', { origin: '' }, 403],
  ['TRACE', '/v1/me', {}, 405],
  ['TRACE', '/v1/auth/mfa-recoveries/11111111-1111-4111-8111-111111111111', {}, 405],
  ['GET', '/ruta-desconocida', {}, undefined],
])(
  'MAR-M1-UT-BE-110-HTTP-D | %s %s respeta origen, método y referencias',
  (method, path, headers, status) => {
    const res = response(),
      next = vi.fn();
    httpPolicy('https://localhost:8443')({ method, path, headers }, res, next);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('Referrer-Policy')).toBe('no-referrer');
    if (status) {
      expect(res.status).toHaveBeenCalledWith(status);
      expect(next).not.toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].request_id).toBe(res.headers.get('x-request-id'));
    } else expect(next).toHaveBeenCalledOnce();
    if (status === 405) expect(res.headers.get('Allow')).toBe('GET, HEAD');
  },
);
it('MAR-M1-UT-BE-102-HTTP-E | cuerpo ausente, incompleto y campos extra se rechazan sin acceder a negocio', () => {
  for (const value of [undefined, null, [], 42, '', {}, { correo: 'a@example.test', rol: 'admin' }])
    expect(() => accountRequest(value, ['correo'])).toThrow(HttpException);
  expect(accountRequest({ correo: 'a@example.test' }, ['correo'])).toEqual({
    correo: 'a@example.test',
  });
});
