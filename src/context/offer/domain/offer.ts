import OfferId from "../../shared/domain/offerId";
import OfferPrice from "./offerPrice";
import BandId from "../../shared/domain/bandId";
import { Equipment, EquipmentPrimitives } from "../../shared/domain/equipment";
import { BandSize } from "./bandSize";
import { InvalidBandSizeException } from "../exceptions/invalidBandSizeException";

export interface OfferPrimitives {
  id: string;
  bandId: string;
  price: number;
  description: string;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  equipment: EquipmentPrimitives[];
  featured: boolean;
  visible: boolean;
}

export default class Offer {
  constructor(
    private id: OfferId,
    private bandId: BandId,
    private price: OfferPrice,
    private location: string,
    private bandSize: BandSize,
    private eventTypeIds: string[],
    private equipment: Equipment[],
    private description: string,
    private featured: boolean,
    private visible: boolean,
  ) {}

  static create(
    bandId: BandId,
    price: OfferPrice,
    description: string,
    location: string,
    bandSize: BandSize,
    eventTypeIds: string[],
    equipment: Equipment[],
    visible: boolean,
  ): Offer {
    return new Offer(
      OfferId.generate(),
      bandId,
      price,
      location,
      bandSize,
      eventTypeIds,
      equipment,
      description,
      false,
      visible,
    );
  }

  static fromPrimitives(offer: OfferPrimitives): Offer {
    const bandSize: BandSize = BandSize[offer.bandSize];
    if (bandSize) {
      throw new InvalidBandSizeException(offer.bandSize);
    }
    return new Offer(
      new OfferId(offer.id),
      new BandId(offer.bandId),
      new OfferPrice(offer.price),
      offer.location,
      bandSize,
      offer.eventTypeIds,
      offer.equipment.map(Equipment.fromPrimitives),
      offer.description,
      offer.featured,
      offer.visible,
    );
  }

  toPrimitives(): OfferPrimitives {
    return {
      id: this.id.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      price: this.price.toPrimitive(),
      location: this.location,
      bandSize: this.bandSize,
      eventTypeIds: this.eventTypeIds,
      equipment: this.equipment.map((equipment) => equipment.toPrimitives()),
      description: this.description,
      featured: this.featured,
      visible: this.visible,
    };
  }
}
