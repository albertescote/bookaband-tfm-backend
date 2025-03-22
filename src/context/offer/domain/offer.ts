import OfferId from "../../shared/domain/offerId";
import OfferPrice from "./offerPrice";
import BandId from "../../shared/domain/bandId";

export interface OfferPrimitives {
  id: string;
  bandId: string;
  price: number;
  visible: boolean;
  description?: string;
}

export default class Offer {
  private readonly description: string;
  constructor(
    private id: OfferId,
    private bandId: BandId,
    private price: OfferPrice,
    private visible: boolean,
    description?: string,
  ) {
    this.description = description;
  }

  static create(bandId: string, price: number, description: string): Offer {
    return new Offer(
      OfferId.generate(),
      new BandId(bandId),
      new OfferPrice(price),
      true,
      description,
    );
  }

  static fromPrimitives(offer: OfferPrimitives): Offer {
    return new Offer(
      new OfferId(offer.id),
      new BandId(offer.bandId),
      new OfferPrice(offer.price),
      offer.visible,
      offer.description,
    );
  }

  toPrimitives(): OfferPrimitives {
    const offerPrimitives = {
      id: this.id.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      price: this.price.toPrimitive(),
      visible: this.visible,
    } as OfferPrimitives;
    if (this.description) offerPrimitives.description = this.description;
    return offerPrimitives;
  }
}
