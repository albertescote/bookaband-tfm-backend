import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Offer from "../domain/offer";
import OfferId from "../../shared/domain/offerId";
import { OfferDetails } from "../domain/offerDetails";
import { OfferOverview } from "../domain/offerOverview";
import { BandSize } from "../domain/bandSize";

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
          eventTypeIds: offerPrimitives.eventTypeIds,
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
          eventTypeIds: offer.eventTypeIds,
          equipment: offer.equipment,
          visible: offer.visible,
        })
      : undefined;
  }

  async getAllOffers(): Promise<Offer[]> {
    const offers = await this.prismaService.offer.findMany({
      include: {
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
        eventTypeIds: offer.eventTypeIds,
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
          eventTypeIds: primitives.eventTypeIds,
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

  async getOfferDetailsById(id: OfferId): Promise<OfferDetails | undefined> {
    const offer = await this.prismaService.offer.findFirst({
      where: { id: id.toPrimitive(), visible: true },
      include: {
        band: true,
        bookings: true,
        equipment: true,
      },
    });

    if (!offer) return undefined;

    return {
      id: offer.id,
      bandId: offer.band.id,
      bandName: offer.band.name,
      genre: offer.band.genre,
      bookingDates: offer.bookings
        .filter((booking) => booking.status === "ACCEPTED")
        .map((booking) => booking.date.toISOString()),
      description: offer.description,
      location: offer.location,
      featured: offer.featured,
      bandSize: offer.bandSize as BandSize,
      equipment: offer.equipment.map((eq) => eq.type),
      eventTypeIds: offer.eventTypeIds,
      reviewCount: offer.band.reviewCount,
      price: offer.price,
      imageUrl: offer.band.imageUrl || undefined,
      rating: offer.band.rating || undefined,
    };
  }

  async getFilteredOffersDetails(
    page: number,
    pageSize: number,
    filters?: { date?: string; location?: string; searchQuery?: string },
  ): Promise<{ offers: OfferDetails[]; total: number }> {
    const whereClause: any = {
      visible: true,
      ...(filters?.location && {
        location: {
          contains: filters.location,
          mode: "insensitive",
        },
      }),
      ...(filters?.searchQuery && {
        band: {
          OR: [
            {
              name: {
                contains: filters.searchQuery,
                mode: "insensitive",
              },
            },
            {
              genre: {
                contains: filters.searchQuery,
                mode: "insensitive",
              },
            },
          ],
        },
      }),
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [offers, total] = await Promise.all([
      this.prismaService.offer.findMany({
        where: whereClause,
        include: {
          band: true,
          bookings: true,
          equipment: true,
        },
        skip,
        take,
      }),
      this.prismaService.offer.count({
        where: whereClause,
      }),
    ]);

    const filteredOffers = filters?.date
      ? offers.filter((offer) =>
          offer.bookings.some(
            (b) =>
              b.status === "ACCEPTED" &&
              b.date.toISOString().split("T")[0] === filters.date,
          ),
        )
      : offers;

    const mappedOffers: OfferDetails[] = filteredOffers.map((offer) => ({
      id: offer.id,
      bandId: offer.band.id,
      bandName: offer.band.name,
      genre: offer.band.genre,
      bookingDates: offer.bookings
        .filter((b) => b.status === "ACCEPTED")
        .map((b) => b.date.toISOString()),
      description: offer.description,
      location: offer.location,
      featured: offer.featured,
      bandSize: offer.bandSize as BandSize,
      equipment: offer.equipment.map((e) => e.type),
      eventTypeIds: offer.eventTypeIds,
      reviewCount: offer.band.reviewCount,
      price: offer.price,
      imageUrl: offer.band.imageUrl || undefined,
      rating: offer.band.rating || undefined,
    }));

    return {
      offers: mappedOffers,
      total,
    };
  }

  async getFeaturedOffersOverview(
    page: number,
    pageSize: number,
  ): Promise<{ offers: OfferOverview[]; total: number }> {
    const whereClause: any = {
      visible: true,
      featured: true,
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [offers, total] = await Promise.all([
      this.prismaService.offer.findMany({
        where: whereClause,
        include: {
          band: true,
          bookings: true,
        },
        skip,
        take,
      }),
      this.prismaService.offer.count({
        where: whereClause,
      }),
    ]);

    return {
      offers: offers.map((offer) => ({
        id: offer.id,
        price: offer.price,
        bandId: offer.band.id,
        bandName: offer.band.name,
        genre: offer.band.genre,
        bookingDates: offer.bookings.map((b) => b.date.toISOString()),
        description: offer.description,
        imageUrl: offer.band.imageUrl,
      })),
      total,
    };
  }
}
