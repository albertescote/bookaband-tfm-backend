import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import BookingId from "../../shared/domain/bookingId";
import { Booking } from "../domain/booking";
import { BookingStatus } from "../../shared/domain/bookingStatus";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { BookingWithDetails } from "../domain/bookingWithDetails";
import ContractId from "../../shared/domain/contractId";

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
          bandId: storedBooking.bandId,
          userId: storedBooking.userId,
          status: BookingStatus[storedBooking.status],
          initDate: storedBooking.initDate,
          endDate: storedBooking.endDate,
          name: storedBooking.name,
          country: storedBooking.country,
          city: storedBooking.city,
          venue: storedBooking.venue,
          postalCode: storedBooking.postalCode,
          addressLine1: storedBooking.addressLine1,
          addressLine2: storedBooking.addressLine2,
          eventTypeId: storedBooking.eventTypeId,
          isPublic: storedBooking.isPublic,
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
          bandId: booking.bandId,
          userId: booking.userId,
          status: BookingStatus[booking.status],
          initDate: booking.initDate,
          endDate: booking.endDate,
          name: booking.name,
          country: booking.country,
          city: booking.city,
          venue: booking.venue,
          postalCode: booking.postalCode,
          addressLine1: booking.addressLine1,
          addressLine2: booking.addressLine2,
          eventTypeId: booking.eventTypeId,
          isPublic: booking.isPublic,
        })
      : undefined;
  }

  async getBookingPrice(bookingId: BookingId): Promise<number> {
    const booking = await this.prismaService.booking.findFirst({
      where: { id: bookingId.toPrimitive() },
      include: {
        band: {
          select: {
            price: true,
          },
        },
      },
    });
    return booking.band.price ?? undefined;
  }

  async findByIdWithDetails(bookingId: BookingId): Promise<BookingWithDetails> {
    const booking = await this.prismaService.booking.findFirst({
      where: { id: bookingId.toPrimitive() },
      include: {
        band: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
      },
    });
    return booking
      ? BookingWithDetails.fromPrimitives({
          id: booking.id,
          bandId: booking.bandId,
          userId: booking.userId,
          status: BookingStatus[booking.status],
          initDate: booking.initDate,
          endDate: booking.endDate,
          name: booking.name,
          userName: booking.user.firstName + " " + booking.user.familyName,
          userImageUrl: booking.user.imageUrl,
          bandName: booking.band.name,
          bandImageUrl: booking.band.imageUrl,
          country: booking.country,
          city: booking.city,
          venue: booking.venue,
          postalCode: booking.postalCode,
          addressLine1: booking.addressLine1,
          addressLine2: booking.addressLine2,
          eventTypeId: booking.eventTypeId,
          isPublic: booking.isPublic,
        })
      : undefined;
  }

  async findAllByUserId(userId: UserId): Promise<BookingWithDetails[]> {
    const bookings = await this.prismaService.booking.findMany({
      where: { userId: userId.toPrimitive() },
      orderBy: { updatedAt: "desc" },
      include: {
        band: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
      },
    });
    return bookings
      ? bookings.map((booking) => {
          return BookingWithDetails.fromPrimitives({
            id: booking.id,
            bandId: booking.bandId,
            userId: booking.userId,
            status: BookingStatus[booking.status],
            initDate: booking.initDate,
            endDate: booking.endDate,
            name: booking.name,
            userName: booking.user.firstName + " " + booking.user.familyName,
            userImageUrl: booking.user.imageUrl,
            bandName: booking.band.name,
            bandImageUrl: booking.band.imageUrl,
            country: booking.country,
            city: booking.city,
            venue: booking.venue,
            postalCode: booking.postalCode,
            addressLine1: booking.addressLine1,
            addressLine2: booking.addressLine2,
            eventTypeId: booking.eventTypeId,
            isPublic: booking.isPublic,
          });
        })
      : undefined;
  }

  async findAllByBandId(bandId: BandId): Promise<BookingWithDetails[]> {
    const bookings = await this.prismaService.booking.findMany({
      where: { bandId: bandId.toPrimitive() },
      orderBy: { updatedAt: "desc" },
      include: {
        band: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
      },
    });
    return bookings
      ? bookings.map((booking) => {
          return BookingWithDetails.fromPrimitives({
            id: booking.id,
            bandId: booking.bandId,
            userId: booking.userId,
            status: BookingStatus[booking.status],
            initDate: booking.initDate,
            endDate: booking.endDate,
            name: booking.name,
            userName: booking.user.firstName + " " + booking.user.familyName,
            userImageUrl: booking.user.imageUrl,
            bandName: booking.band.name,
            bandImageUrl: booking.band.imageUrl,
            country: booking.country,
            city: booking.city,
            venue: booking.venue,
            postalCode: booking.postalCode,
            addressLine1: booking.addressLine1,
            addressLine2: booking.addressLine2,
            eventTypeId: booking.eventTypeId,
            isPublic: booking.isPublic,
          });
        })
      : undefined;
  }

  async findByContractId(contractId: ContractId) {
    const booking = await this.prismaService.booking.findFirst({
      where: { contract: { id: contractId.toPrimitive() } },
    });
    return booking
      ? Booking.fromPrimitives({
          id: booking.id,
          bandId: booking.bandId,
          userId: booking.userId,
          status: BookingStatus[booking.status],
          initDate: booking.initDate,
          endDate: booking.endDate,
          name: booking.name,
          country: booking.country,
          city: booking.city,
          venue: booking.venue,
          postalCode: booking.postalCode,
          addressLine1: booking.addressLine1,
          addressLine2: booking.addressLine2,
          eventTypeId: booking.eventTypeId,
          isPublic: booking.isPublic,
        })
      : undefined;
  }
}
