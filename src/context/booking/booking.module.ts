import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { BookingService } from "./service/booking.service";
import { BookingRepository } from "./infrastructure/booking.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { CqrsModule } from "@nestjs/cqrs";
import { GetUserIdByBookingIdQueryHandler } from "./service/getUserIdByBookingId.queryHandler";
import { GetBookingByIdQueryHandler } from "./service/getBookingById.queryHandler";
import { GetBookingByContractIdQueryHandler } from "./service/getBookingByContractId.queryHandler";
import { GetBookingPriceQueryHandler } from "./service/getBookingPrice.queryHandler";
import { UpdateBookingStatusOnContractSignedEventHandler } from "./service/updateBookingStatusOnContractSigned.eventHandler";

@Module({
  imports: [CqrsModule],
  providers: [
    BookingService,
    BookingRepository,
    PrismaService,
    ModuleConnectors,
    GetUserIdByBookingIdQueryHandler,
    GetBookingByIdQueryHandler,
    GetBookingByContractIdQueryHandler,
    GetBookingPriceQueryHandler,
    UpdateBookingStatusOnContractSignedEventHandler,
  ],
  exports: [
    BookingService,
    GetUserIdByBookingIdQueryHandler,
    GetBookingByIdQueryHandler,
    GetBookingByContractIdQueryHandler,
    GetBookingPriceQueryHandler,
    UpdateBookingStatusOnContractSignedEventHandler,
  ],
})
export class BookingModule {}
