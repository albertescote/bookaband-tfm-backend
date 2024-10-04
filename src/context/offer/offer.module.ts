import { Module } from "@nestjs/common";
import { OfferService } from "./service/offer.service";
import { OfferRepository } from "./infrastructure/offer.repository";
import { UserRepository } from "../user/infrastructure/user.repository";
import { CqrsModule } from "@nestjs/cqrs";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";

@Module({
  imports: [CqrsModule],
  providers: [
    OfferService,
    OfferRepository,
    UserRepository,
    PrismaService,
    ModuleConnectors,
  ],
  exports: [OfferService],
})
export class OfferModule {}
