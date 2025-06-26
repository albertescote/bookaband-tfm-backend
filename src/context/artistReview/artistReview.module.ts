import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { CreateArtistReviewCommandHandler } from "./service/createArtistReview.commandHandler";
import { GetReviewByBookingIdQueryHandler } from "./service/getReviewByBookingId.queryHandler";
import { ArtistReviewRepository } from "./infrastructure/artistReview.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
  imports: [CqrsModule],
  providers: [
    PrismaService,
    ModuleConnectors,
    CreateArtistReviewCommandHandler,
    GetReviewByBookingIdQueryHandler,
    ArtistReviewRepository,
  ],
  exports: [CreateArtistReviewCommandHandler, GetReviewByBookingIdQueryHandler],
})
export class ArtistReviewModule {}
