import OfferId from './offerId';
import UserId from '../../shared/domain/userId';

export interface OfferPrimitives {
  id: string;
  topic: string;
  ownerId: string;
  studentId: string;
}

export default class Offer {
  constructor(
    private id: OfferId,
    private topic: string,
    private ownerId: UserId,
    private studentId: UserId,
  ) {}

  static fromPrimitives(offer: OfferPrimitives): Offer {
    return new Offer(
      new OfferId(offer.id),
      offer.topic,
      new UserId(offer.ownerId),
      new UserId(offer.studentId),
    );
  }

  toPrimitives(): OfferPrimitives {
    return {
      id: this.id.toPrimitive(),
      topic: this.topic,
      ownerId: this.ownerId.toPrimitive(),
      studentId: this.studentId.toPrimitive(),
    };
  }
}
