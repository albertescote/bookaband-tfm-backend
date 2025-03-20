import { Module } from "@nestjs/common";
import { OfferService } from "./service/offer.service";
import { OfferRepository } from "./infrastructure/offer.repository";
import { UserRepository } from "../user/infrastructure/user.repository";
import { CqrsModule } from "@nestjs/cqrs";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { GetOfferInfoQueryHandler } from "./service/getOfferInfo.queryHandler";

@Module({
  imports: [CqrsModule],
  providers: [
    OfferService,
    OfferRepository,
    UserRepository,
    PrismaService,
    ModuleConnectors,
    GetOfferInfoQueryHandler,
  ],
  exports: [OfferService, GetOfferInfoQueryHandler],
})
export class OfferModule {}
