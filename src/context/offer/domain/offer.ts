import OfferId from "./offerId";
import OfferPrice from "./offerPrice";
import BandId from "../../shared/domain/bandId";

export interface OfferPrimitives {
  id: string;
  bandId: string;
  price: number;
  description?: string;
}

export default class Offer {
  private readonly description: string;
  constructor(
    private id: OfferId,
    private bandId: BandId,
    private price: OfferPrice,
    description?: string,
  ) {
    this.description = description;
  }

  static fromPrimitives(offer: OfferPrimitives): Offer {
    return new Offer(
      new OfferId(offer.id),
      new BandId(offer.bandId),
      new OfferPrice(offer.price),
      offer.description,
    );
  }

  toPrimitives(): OfferPrimitives {
    const offerPrimitives = {
      id: this.id.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      price: this.price.toPrimitive(),
    } as OfferPrimitives;
    if (this.description) offerPrimitives.description = this.description;
    return offerPrimitives;
  }
}
