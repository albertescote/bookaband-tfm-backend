import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import BookingId from "../domain/bookingId";
import { Booking } from "../domain/booking";
import { BookingStatus } from "../domain/bookingStatus";

@Injectable()
export class BookingRepository {
  constructor(private prismaService: PrismaService) {}

  async save(booking: Booking): Promise<Booking> {
    const storedBooking = await this.prismaService.booking.upsert({
      where: { id: booking.toPrimitives().id },
      update: booking.toPrimitives(),
      create: booking.toPrimitives(),
    });

    return storedBooking
      ? Booking.fromPrimitives({
          id: storedBooking.id,
          offerId: storedBooking.offerId,
          userId: storedBooking.userId,
          status: BookingStatus[storedBooking.status],
          date: storedBooking.date,
          createdAt: storedBooking.createdAt,
        })
      : undefined;
  }

  async findById(bookingId: BookingId): Promise<Booking> {
    const booking = await this.prismaService.booking.findFirst({
      where: { id: bookingId.toPrimitive() },
    });
    return booking
      ? Booking.fromPrimitives({
          id: booking.id,
          offerId: booking.offerId,
          userId: booking.userId,
          status: BookingStatus[booking.status],
          date: booking.date,
          createdAt: booking.createdAt,
        })
      : undefined;
  }
}
