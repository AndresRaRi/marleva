import { PhotoController } from './presentation/photo.controller.js';
import { ReadPhoto } from './application/use-cases/read-photo.js';
import { PrismaPublicPhotoReader } from './infrastructure/repositories/prisma-public-photo-reader.js';
import { LocalPhotoStore } from './infrastructure/adapters/local-photo-store.js';
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
      controllers: [CatalogController, PhotoController],
      providers: [
        {
          provide: ReadPhoto,
          useFactory: () => new ReadPhoto(new PrismaPublicPhotoReader(sql), new LocalPhotoStore()),
        },
        {
          provide: ReadCatalog,
          useFactory: () => new ReadCatalog(new PrismaCatalogRepository(sql)),
        },
      ],
    };
  }
}
