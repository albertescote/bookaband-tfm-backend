import OfferId from './offerId';
import UserId from '../../shared/domain/userId';

export interface OfferPrimitives {
  id: string;
  topic: string;
  ownerId: string;
  clientId: string;
}

export default class Offer {
  constructor(
    private id: OfferId,
    private topic: string,
    private ownerId: UserId,
    private clientId: UserId,
  ) {}

  static fromPrimitives(offer: OfferPrimitives): Offer {
    return new Offer(
      new OfferId(offer.id),
      offer.topic,
      new UserId(offer.ownerId),
      new UserId(offer.clientId),
    );
  }

  toPrimitives(): OfferPrimitives {
    return {
      id: this.id.toPrimitive(),
      topic: this.topic,
      ownerId: this.ownerId.toPrimitive(),
      clientId: this.clientId.toPrimitive(),
    };
  }
}
