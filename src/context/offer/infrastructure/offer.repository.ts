import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Offer from "../domain/offer";
import OfferId from "../domain/offerId";
import { MusicGenre } from "../domain/musicGenre";

@Injectable()
export class OfferRepository {
  constructor(private prismaService: PrismaService) {}

  async addOffer(offer: Offer): Promise<Offer> {
    const offerPrimitives = offer.toPrimitives();
    try {
      await this.prismaService.offer.create({
        data: {
          id: offerPrimitives.id,
          ownerId: offerPrimitives.ownerId,
          price: offerPrimitives.price,
          bandName: offerPrimitives.bandName,
          genre: offerPrimitives.genre,
          description: offerPrimitives.description,
          imageUrl: offerPrimitives.imageUrl,
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
          ownerId: offer.ownerId,
          price: offer.price,
          bandName: offer.bandName,
          genre: MusicGenre[offer.genre],
          description: offer.description,
          imageUrl: offer.imageUrl,
        })
      : undefined;
  }

  async getAllOffers(): Promise<Offer[]> {
    const offers = await this.prismaService.offer.findMany();
    return offers.map((offer) => {
      return Offer.fromPrimitives({
        id: offer.id,
        ownerId: offer.ownerId,
        price: offer.price,
        bandName: offer.bandName,
        genre: MusicGenre[offer.genre],
        description: offer.description,
        imageUrl: offer.imageUrl,
      });
    });
  }

  async updateOffer(id: OfferId, updatedOffer: Offer): Promise<Offer> {
    try {
      await this.prismaService.offer.update({
        where: { id: id.toPrimitive() },
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
