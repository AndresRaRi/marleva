import {
  Controller,
  Post,
  Get,
  Delete,
  Req,
  Res,
  Param,
  Body,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AccountService } from '../../../../account.service.js';
import { IssueFileAccess } from '../../application/use-cases/issue-file-access.js';
import { ReadPrivateFile } from '../../application/use-cases/read-private-file.js';
import { DeletePrivateFile } from '../../application/use-cases/delete-private-file.js';
import { FileFault } from '../../domain/file-fault.js';
import { fixtureId, deletionInput } from '../dtos/file-request.js';
const errors = {
  session: [401, 'SESION_VENCIDA', 'La sesión venció'],
  missing: [404, 'ARCHIVO_NO_DISPONIBLE', 'El archivo no está disponible'],
  capability: [403, 'CAPACIDAD_INVALIDA', 'El acceso temporal no es válido'],
  conflict: [409, 'CONFLICTO', 'La solicitud no coincide con el estado actual'],
  input: [422, 'SOLICITUD_INVALIDA', 'Revisa la solicitud'],
  limit: [429, 'LIMITE', 'Espera antes de solicitar otro acceso'],
  integrity: [503, 'INTEGRIDAD', 'No se pudo comprobar el archivo'],
  dependency: [503, 'DEPENDENCIA', 'Una dependencia local no está disponible'],
} as const;
@Controller('v1/local/file-fixtures')
export class PrivateFilesController {
  constructor(
    private readonly accounts: AccountService,
    private readonly issue: IssueFileAccess,
    private readonly read: ReadPrivateFile,
    private readonly deletion: DeletePrivateFile,
  ) {}
  private async run<T>(res: Response, operation: () => Promise<T>) {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof FileFault)) throw error;
      const [status, codigo, mensaje] = errors[error.kind];
      if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter));
      throw new HttpException(
        {
          codigo,
          mensaje,
          accion_recuperacion:
            error.kind === 'session'
              ? 'Inicia sesión de nuevo'
              : 'Revisa el estado e intenta de nuevo',
        },
        status,
      );
    }
  }
  @Post(':id/access')
  access(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ) {
    return this.run(res, async () => {
      const p = await this.accounts.principal(request, true);
      return this.issue.execute(
        { accountId: p.account.id, sessionId: p.session.id },
        fixtureId(id),
      );
    });
  }
  @Get(':id/content')
  async content(@Req() request: Request, @Res() res: Response, @Param('id') id: string) {
    const data = await this.run(res, async () => {
      const p = await this.accounts.principal(request);
      return this.read.execute(
        { accountId: p.account.id, sessionId: p.session.id },
        fixtureId(id),
        request.get('x-fixture-capability') ?? '',
      );
    });
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(data));
  }
  @Delete(':id')
  async remove(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const result = await this.run(res, async () => {
      const p = await this.accounts.principal(request, true);
      const input = deletionInput(body, request.get('Idempotency-Key'));
      return this.deletion.execute(
        { accountId: p.account.id, sessionId: p.session.id },
        fixtureId(id),
        input.key,
        input.version,
      );
    });
    res.status(result.estado === 'deleted' ? 200 : 202);
    return result;
  }
}
