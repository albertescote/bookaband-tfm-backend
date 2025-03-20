import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Offer from "../domain/offer";
import OfferId from "../../shared/domain/offerId";

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
    });
    return offer
      ? Offer.fromPrimitives({
          id: offer.id,
          bandId: offer.bandId,
          price: offer.price,
          description: offer.description,
        })
      : undefined;
  }

  async getAllOffers(): Promise<Offer[]> {
    const offers = await this.prismaService.offer.findMany();
    return offers.map((offer) => {
      return Offer.fromPrimitives({
        id: offer.id,
        bandId: offer.bandId,
        price: offer.price,
        description: offer.description,
      });
    });
  }

  async updateOffer(updatedOffer: Offer): Promise<Offer> {
    try {
      await this.prismaService.offer.update({
        where: { id: updatedOffer.toPrimitives().id },
        data: updatedOffer.toPrimitives(),
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
}
