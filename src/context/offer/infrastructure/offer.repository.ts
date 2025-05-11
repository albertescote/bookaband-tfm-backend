import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Offer from "../domain/offer";
import OfferId from "../../shared/domain/offerId";
import { OfferDetails } from "../domain/offerDetails";
import { BookingStatus } from "../../booking/domain/bookingStatus";

@Injectable()
export class OfferRepository {
  constructor(private prismaService: PrismaService) {}

  async addOffer(offer: Offer): Promise<Offer> {
    const offerPrimitives = offer.toPrimitives();
    try {
      await this.prismaService.offer.create({
        data: {
          id: offerPrimitives.id,
          bandId: offerPrimitives.bandId,
          price: offerPrimitives.price,
          description: offerPrimitives.description,
          location: offerPrimitives.location,
          featured: offerPrimitives.featured,
          bandSize: offerPrimitives.bandSize,
          visible: offerPrimitives.visible,
          eventTypes: {
            connect: offerPrimitives.eventTypeIds.map((id) => ({ id })),
          },
          equipment: {
            create: offerPrimitives.equipment.map((e) => ({
              id: e.id,
              type: e.type,
            })),
          },
        },
      });
      return offer;
    } catch (e) {
      return undefined;
    }
  }

  async getOfferById(id: OfferId): Promise<Offer> {
    const offer = await this.prismaService.offer.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        eventTypes: true,
        equipment: true,
      },
    });
    return offer
      ? Offer.fromPrimitives({
          id: offer.id,
          bandId: offer.bandId,
          price: offer.price,
          description: offer.description,
          location: offer.location,
          featured: offer.featured,
          bandSize: offer.bandSize,
          eventTypeIds: offer.eventTypes.map((eventType) => eventType.id),
          equipment: offer.equipment,
          visible: offer.visible,
        })
      : undefined;
  }

  async getAllOffers(): Promise<Offer[]> {
    const offers = await this.prismaService.offer.findMany({
      include: {
        eventTypes: true,
        equipment: true,
      },
    });
    return offers.map((offer) => {
      return Offer.fromPrimitives({
        id: offer.id,
        bandId: offer.bandId,
        price: offer.price,
        description: offer.description,
        location: offer.location,
        featured: offer.featured,
        bandSize: offer.bandSize,
        eventTypeIds: offer.eventTypes.map((eventType) => eventType.id),
        equipment: offer.equipment,
        visible: offer.visible,
      });
    });
  }

  async updateOffer(updatedOffer: Offer): Promise<Offer> {
    const primitives = updatedOffer.toPrimitives();
    try {
      await this.prismaService.offer.update({
        where: { id: primitives.id },
        data: {
          bandId: primitives.bandId,
          price: primitives.price,
          description: primitives.description,
          location: primitives.location,
          bandSize: primitives.bandSize,
          eventTypes: {
            set: primitives.eventTypeIds.map((id) => ({ id })),
          },
          equipment: {
            deleteMany: {},
            create: primitives.equipment.map((e) => ({
              id: e.id,
              type: e.type,
            })),
          },
          featured: primitives.featured,
          visible: primitives.visible,
        },
      });
      return updatedOffer;
    } catch {
      return undefined;
    }
  }

  async deleteOffer(id: OfferId): Promise<boolean> {
    try {
      await this.prismaService.offer.delete({
        where: { id: id.toPrimitive() },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getOfferDetailsById(id: OfferId): Promise<OfferDetails> {
    const offer = await this.prismaService.offer.findFirst({
      where: { id: id.toPrimitive(), visible: true },
      include: {
        band: true,
        bookings: true,
      },
    });
    return offer
      ? {
          id: offer.id,
          price: offer.price,
          bandId: offer.band.id,
          bandName: offer.band.name,
          genre: offer.band.genre,
          bookingDates: offer.bookings
            .filter((booking) => booking.status === BookingStatus.ACCEPTED)
            .map((booking) => booking.date.toISOString()),
          description: offer.description,
          imageUrl: offer.band.imageUrl,
        }
      : undefined;
  }

  async getAllOffersDetails(): Promise<OfferDetails[]> {
    const offers = await this.prismaService.offer.findMany({
      where: { visible: true },
      include: {
        band: true,
        bookings: true,
      },
    });
    if (!offers) return [];
    return offers.map((offer) => {
      return {
        id: offer.id,
        price: offer.price,
        bandId: offer.band.id,
        bandName: offer.band.name,
        genre: offer.band.genre,
        bookingDates: offer.bookings.map((booking) =>
          booking.date.toISOString(),
        ),
        description: offer.description,
        imageUrl: offer.band.imageUrl,
      };
    });
  }

  async getFeaturedOffersDetails(): Promise<OfferDetails[]> {
    const offers = await this.prismaService.offer.findMany({
      where: { visible: true, featured: true },
      include: {
        band: true,
        bookings: true,
      },
    });
    if (!offers) return [];
    return offers.map((offer) => {
      return {
        id: offer.id,
        price: offer.price,
        bandId: offer.band.id,
        bandName: offer.band.name,
        genre: offer.band.genre,
        bookingDates: offer.bookings.map((booking) =>
          booking.date.toISOString(),
        ),
        description: offer.description,
        imageUrl: offer.band.imageUrl,
      };
    });
  }
}
