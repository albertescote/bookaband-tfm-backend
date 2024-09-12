import { Injectable } from '@nestjs/common';
import Offer, { OfferPrimitives } from '../domain/offer';
import OfferId from '../domain/offerId';

@Injectable()
export class OfferRepository {
  private offers: OfferPrimitives[] = [];

  addOffer(offer: Offer): Offer {
    this.offers.push(offer.toPrimitives());
    return offer;
  }

  getOfferById(id: OfferId): Offer {
    const offer = this.offers.find(
      (offer) => offer.id === id.toPrimitive(),
    );
    return offer ? Offer.fromPrimitives(offer) : null;
  }

  getAllOffers(): Offer[] {
    return this.offers.map((offer) => {
      return Offer.fromPrimitives(offer);
    });
  }

  updateOffer(id: OfferId, updatedOffer: Offer): Offer {
    const index = this.offers.findIndex(
      (offer) => offer.id === id.toPrimitive(),
    );
    if (index !== -1) {
      this.offers[index] = {
        ...this.offers[index],
        ...updatedOffer.toPrimitives(),
      };
      return Offer.fromPrimitives(this.offers[index]);
    }
    return null;
  }

  deleteOffer(id: OfferId): boolean {
    const index = this.offers.findIndex(
      (offer) => offer.id === id.toPrimitive(),
    );
    if (index !== -1) {
      this.offers.splice(index, 1);
      return true;
    }
    return false;
  }
}
