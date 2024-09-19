import { Module } from "@nestjs/common";
import { OfferService } from "./service/offer.service";
import { OfferRepository } from "./infrastructure/offer.repository";
import { UserRepository } from "../user/infrastructure/user.repository";
import { CqrsModule } from "@nestjs/cqrs";
import PrismaService from "../shared/infrastructure/db/prisma.service";

@Module({
  imports: [CqrsModule],
  providers: [OfferService, OfferRepository, UserRepository, PrismaService],
  exports: [OfferService],
})
export class OfferModule {}
