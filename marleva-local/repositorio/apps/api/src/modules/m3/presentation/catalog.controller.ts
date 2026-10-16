import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReadCatalog } from '../application/use-cases/read-catalog.js';
import { parseQuery } from './dtos/catalog-query.js';
import { uuid } from './dtos/validation.js';
@Controller('/v1/catalog')
export class CatalogController {
  constructor(private readonly reader: ReadCatalog) {}
  @Get('/offers')
  list(@Query() query: unknown) {
    return this.reader.list(parseQuery(query));
  }
  @Get('/offers/:id')
  detail(@Param('id') id: string) {
    return this.reader.detail(uuid(id));
  }
  @Get('/sellers/:id')
  seller(@Param('id') id: string) {
    return this.reader.seller(uuid(id));
  }
}
