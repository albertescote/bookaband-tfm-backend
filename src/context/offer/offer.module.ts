import { Module } from '@nestjs/common';
import { OfferService } from './service/offer.service';
import { OfferRepository } from './infrastructure/offerRepository';
import { UserRepository } from '../user/infrastructure/userRepository';
import RsaSigner from '../shared/infrastructure/rsaSigner';
import { CqrsModule } from '@nestjs/cqrs';
import { ModuleConnectors } from '../shared/infrastructure/moduleConnectors';

@Module({
  imports: [CqrsModule],
  providers: [
    OfferService,
    OfferRepository,
    UserRepository,
    RsaSigner,
    ModuleConnectors,
  ],
  exports: [OfferService],
})
export class OfferModule {}
