import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import BookingId from "../domain/bookingId";
import { Booking } from "../domain/booking";
import { BookingStatus } from "../domain/bookingStatus";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";

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

  async findAllByUserId(userId: UserId) {
    const bookings = await this.prismaService.booking.findMany({
      where: { userId: userId.toPrimitive() },
    });
    return bookings
      ? bookings.map((booking) => {
          return Booking.fromPrimitives({
            id: booking.id,
            offerId: booking.offerId,
            userId: booking.userId,
            status: BookingStatus[booking.status],
            date: booking.date,
            createdAt: booking.createdAt,
          });
        })
      : undefined;
  }

  async findAllByBandId(bandId: BandId) {
    const bookings = await this.prismaService.booking.findMany({
      where: { offer: { bandId: bandId.toPrimitive() } },
    });
    return bookings
      ? bookings.map((booking) => {
          return Booking.fromPrimitives({
            id: booking.id,
            offerId: booking.offerId,
            userId: booking.userId,
            status: BookingStatus[booking.status],
            date: booking.date,
            createdAt: booking.createdAt,
          });
        })
      : undefined;
  }
}
