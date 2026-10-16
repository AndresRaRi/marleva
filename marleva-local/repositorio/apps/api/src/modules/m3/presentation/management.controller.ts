import {
  Controller,
  HttpCode,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Query,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ManageOffers } from '../application/use-cases/manage-offers.js';
import type { Actor, Command } from '../domain/offer-transition.js';
import { fail } from '../domain/catalog.js';
import { uuid, choice, integer, string } from './dtos/validation.js';
import { managementCommand, managedQuery } from './dtos/manage-offer.js';
export interface ManagedRequest extends Request {
  m3actor?: Actor;
  m3csrf?: string;
}
function actor(req: ManagedRequest): Actor {
  return req.m3actor ?? fail('SESSION', 'Inicia sesión para continuar.', 401);
}
@Controller('/v1/offers')
export class ManagementController {
  constructor(private readonly service: ManageOffers) {}
  @Get() list(@Req() req: ManagedRequest, @Query() query: unknown) {
    return this.service.list(actor(req), managedQuery(query));
  }
  @Get('/context')
  async context(@Req() req: ManagedRequest) {
    const current = actor(req);
    return {
      actor_id: current.id,
      reviewer: current.reviewer,
      mfa: current.mfa,
      csrf_token: req.m3csrf ?? null,
      sellers: await this.service.context(current),
    };
  }
  @Get('/:id') detail(@Req() req: ManagedRequest, @Param('id') id: string) {
    return this.service.detail(uuid(id), actor(req));
  }
  private async command(
    operation: Command['operation'],
    req: ManagedRequest,
    id: string,
    body: unknown,
  ) {
    const current = actor(req);
    const sellerId =
      operation === 'create' ? '' : (await this.service.detail(uuid(id), current)).seller_id;
    return this.service.execute(
      managementCommand(operation, body, id, req.header('Idempotency-Key'), sellerId),
      current,
    );
  }
  @Post()
  @HttpCode(200)
  create(@Req() req: ManagedRequest, @Body() body: unknown) {
    return this.command('create', req, '', body);
  }
  @Patch('/:id') edit(@Req() req: ManagedRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.command('edit', req, id, body);
  }
  @Post('/:id/submit')
  @HttpCode(200)
  submit(@Req() req: ManagedRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.command('submit', req, id, body);
  }
  @Post('/:id/decisions')
  @HttpCode(200)
  decide(@Req() req: ManagedRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.command('decide', req, id, body);
  }
  @Post('/:id/pause')
  @HttpCode(200)
  pause(@Req() req: ManagedRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.command('pause', req, id, body);
  }
  @Put('/:id/versions/:version/photos/:photo') async attach(
    @Req() req: ManagedRequest,
    @Param('id') id: string,
    @Param('version') version: string,
    @Param('photo') photo: string,
    @Query('position') position: unknown,
    @Body() bytes: unknown,
  ) {
    const value = await this.service.attach(
      uuid(id),
      {
        id: uuid(photo),
        version_id: uuid(version),
        position: integer(Number(string(position, 1, 1)), 1, 6),
        mime: choice(req.header('content-type'), ['image/jpeg', 'image/png']),
        bytes: Buffer.isBuffer(bytes) ? bytes : Buffer.alloc(0),
      },
      actor(req),
    );
    return value;
  }
  @Get('/:id/photos/:photo/:size') async photo(
    @Req() req: ManagedRequest,
    @Param('id') id: string,
    @Param('photo') photo: string,
    @Param('size') size: string,
    @Res() response: Response,
  ) {
    const bytes = await this.service.readPhoto(
      uuid(id),
      uuid(photo),
      choice(size, ['card', 'detail']),
      actor(req),
    );
    response
      .set({
        'Content-Type': 'image/jpeg',
        'Content-Length': String(bytes.length),
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      })
      .send(bytes);
  }
}
