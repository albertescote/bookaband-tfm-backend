import OfferId from "./offerId";
import UserId from "../../shared/domain/userId";
import OfferPrice from "./offerPrice";
import { MusicGenre } from "./musicGenre";

export interface OfferPrimitives {
  id: string;
  ownerId: string;
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

export default class Offer {
  private description: string;
  private imageUrl: string;
  constructor(
    private id: OfferId,
    private ownerId: UserId,
    private price: OfferPrice,
    private bandName: string,
    private genre: MusicGenre,
    description?: string,
    imageUrl?: string,
  ) {
    this.description = description;
    this.imageUrl = imageUrl;
  }

  static fromPrimitives(offer: OfferPrimitives): Offer {
    return new Offer(
      new OfferId(offer.id),
      new UserId(offer.ownerId),
      new OfferPrice(offer.price),
      offer.bandName,
      offer.genre,
      offer.description,
      offer.imageUrl,
    );
  }

  toPrimitives(): OfferPrimitives {
    const offerPrimitives = {
      id: this.id.toPrimitive(),
      ownerId: this.ownerId.toPrimitive(),
      price: this.price.toPrimitive(),
      bandName: this.bandName,
      genre: this.genre,
    } as OfferPrimitives;
    if (this.description) offerPrimitives.description = this.description;
    if (this.imageUrl) offerPrimitives.imageUrl = this.imageUrl;
    return offerPrimitives;
  }
}
