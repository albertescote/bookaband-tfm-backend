import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { MusicGenre } from "./musicGenre";

export interface OfferPrimitives {
  id: string;
  name: string;
  membersId: string[];
  genre: MusicGenre;
  imageUrl?: string;
}

export default class Band {
  private readonly imageUrl: string;
  constructor(
    private id: BandId,
    private name: string,
    private membersId: UserId[],
    private genre: MusicGenre,
    imageUrl?: string,
  ) {
    this.imageUrl = imageUrl;
  }

  static fromPrimitives(offer: OfferPrimitives): Band {
    return new Band(
      new BandId(offer.id),
      offer.name,
      offer.membersId.map((memberId) => {
        return new UserId(memberId);
      }),
      offer.genre,
      offer.imageUrl,
    );
  }

  toPrimitives(): OfferPrimitives {
    const offerPrimitives = {
      id: this.id.toPrimitive(),
      name: this.name,
      membersId: this.membersId.map((memberId) => {
        return memberId.toPrimitive();
      }),
      genre: this.genre,
    } as OfferPrimitives;
    if (this.imageUrl) offerPrimitives.imageUrl = this.imageUrl;
    return offerPrimitives;
  }
}
