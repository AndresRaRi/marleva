import { Module, type DynamicModule } from '@nestjs/common';
import { ManagementController } from './presentation/management.controller.js';
import { ManageOffers } from './application/use-cases/manage-offers.js';
import { ChangeOffer } from './application/use-cases/change-offer.js';
import { AttachPhoto } from './application/use-cases/attach-photo.js';
import { PrismaOfferRepository } from './infrastructure/repositories/prisma-offer-repository.js';
import { PrismaPhotoRepository } from './infrastructure/repositories/prisma-photo-repository.js';
import { PrismaManagedOffers } from './infrastructure/repositories/prisma-managed-offers.js';
import { LocalPhotoStore } from './infrastructure/adapters/local-photo-store.js';
import { SharpPhotoProcessor } from './infrastructure/adapters/sharp-photo-processor.js';
import type { TransactionalSql } from './infrastructure/sql.js';
@Module({})
export class ManagementModule {
  static register(sql: TransactionalSql): DynamicModule {
    const store = new LocalPhotoStore();
    const service = new ManageOffers(
      new PrismaManagedOffers(sql),
      new ChangeOffer(new PrismaOfferRepository(sql)),
      new AttachPhoto(new PrismaPhotoRepository(sql), store, new SharpPhotoProcessor()),
      store,
    );
    return {
      module: ManagementModule,
      controllers: [ManagementController],
      providers: [{ provide: ManageOffers, useValue: service }],
    };
  }
}
