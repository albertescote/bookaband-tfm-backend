import OfferId from './offerId';
import UserId from '../../shared/domain/userId';
import OfferPrice from "./offerPrice";

export interface OfferPrimitives {
  id: string;
  description: string;
  ownerId: string;
  price: number;
}

export default class Offer {
  constructor(
    private id: OfferId,
    private description: string,
    private ownerId: UserId,
    private price: OfferPrice,
  ) {}

  static fromPrimitives(offer: OfferPrimitives): Offer {
    return new Offer(
      new OfferId(offer.id),
      offer.description,
      new UserId(offer.ownerId),
      new OfferPrice(offer.price),
    );
  }

  toPrimitives(): OfferPrimitives {
    return {
      id: this.id.toPrimitive(),
      description: this.description,
      ownerId: this.ownerId.toPrimitive(),
      price: this.price.toPrimitive(),
    };
  }
}
