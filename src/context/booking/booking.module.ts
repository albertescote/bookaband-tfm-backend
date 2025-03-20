import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { BookingService } from "./service/booking.service";
import { BookingRepository } from "./infrastructure/booking.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";

@Module({
  imports: [],
  providers: [
    BookingService,
    BookingRepository,
    PrismaService,
    ModuleConnectors,
  ],
  exports: [BookingService],
})
export class BookingModule {}
