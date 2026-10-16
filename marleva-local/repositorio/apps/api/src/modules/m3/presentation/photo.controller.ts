import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReadPhoto } from '../application/use-cases/read-photo.js';
import { uuid, choice } from './dtos/validation.js';
@Controller('/v1/catalog/photos')
export class PhotoController {
  constructor(private readonly reader: ReadPhoto) {}
  @Get('/:id/:size')
  async read(@Param('id') id: string, @Param('size') size: string, @Res() response: Response) {
    const bytes = await this.reader.execute(uuid(id), choice(size, ['card', 'detail'] as const));
    response.setHeader('Content-Type', 'image/jpeg');
    response.setHeader('Content-Length', String(bytes.length));
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    response.setHeader('Cache-Control', 'no-store');
    response.send(bytes);
  }
}
