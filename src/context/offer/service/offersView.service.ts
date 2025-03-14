import { Injectable } from "@nestjs/common";
import OfferId from "../domain/offerId";
import { OfferRepository } from "../infrastructure/offer.repository";
import { OfferNotFoundException } from "../exceptions/offerNotFoundException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";

export interface OffersViewResponse {
  id: string;
  price: number;
  bandId: string;
  bandName: string;
  genre: string;
  description?: string;
  imageUrl?: string;
}

@Injectable()
export class OffersViewService {
  constructor(
    private offerRepository: OfferRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async getById(id: string): Promise<OffersViewResponse> {
    const storedOffer = await this.offerRepository.getOfferById(
      new OfferId(id),
    );
    if (!storedOffer) {
      throw new OfferNotFoundException(id);
    }
    const offerPrimitives = storedOffer.toPrimitives();
    const band = await this.moduleConnectors.obtainBandInformation(
      offerPrimitives.bandId,
    );
    return {
      id: offerPrimitives.id,
      price: offerPrimitives.price,
      bandId: band.id,
      bandName: band.name,
      genre: band.genre,
      description: offerPrimitives.description,
      imageUrl: band.imageUrl,
    };
  }

  async getAll(): Promise<OffersViewResponse[]> {
    const offers = await this.offerRepository.getAllOffers();
    const offersView: OffersViewResponse[] = [];
    for (const offer of offers) {
      const offerPrimitives = offer.toPrimitives();
      const band = await this.moduleConnectors.obtainBandInformation(
        offerPrimitives.bandId,
      );
      offersView.push({
        id: offerPrimitives.id,
        price: offerPrimitives.price,
        bandId: band.id,
        bandName: band.name,
        genre: band.genre,
        description: offerPrimitives.description,
        imageUrl: band.imageUrl,
      });
    }
    return offersView;
  }
}
