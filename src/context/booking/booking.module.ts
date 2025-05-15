import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { BookingService } from "./service/booking.service";
import { BookingRepository } from "./infrastructure/booking.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { CqrsModule } from "@nestjs/cqrs";
import { GetUserIdByBookingIdQueryHandler } from "./service/getUserIdByBookingId.queryHandler";

@Module({
  imports: [CqrsModule],
  providers: [
    BookingService,
    BookingRepository,
    PrismaService,
    ModuleConnectors,
    GetUserIdByBookingIdQueryHandler,
  ],
  exports: [BookingService, GetUserIdByBookingIdQueryHandler],
})
export class BookingModule {}
