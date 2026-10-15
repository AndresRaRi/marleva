import { Module, type DynamicModule } from '@nestjs/common';
import { CatalogController } from './presentation/catalog.controller.js';
import { ReadCatalog } from './application/use-cases/read-catalog.js';
import { PrismaCatalogRepository } from './infrastructure/repositories/prisma-catalog-repository.js';
import type { Sql } from './infrastructure/sql.js';
@Module({})
export class CatalogModule {
  static register(sql: Sql): DynamicModule {
    return {
      module: CatalogModule,
      controllers: [CatalogController],
      providers: [
        {
          provide: ReadCatalog,
          useFactory: () => new ReadCatalog(new PrismaCatalogRepository(sql)),
        },
      ],
    };
  }
}
