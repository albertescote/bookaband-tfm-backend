import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { MusicGenre } from "./musicGenre";

export interface BandPrimitives {
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

  static fromPrimitives(band: BandPrimitives): Band {
    return new Band(
      new BandId(band.id),
      band.name,
      band.membersId.map((memberId) => {
        return new UserId(memberId);
      }),
      band.genre,
      band.imageUrl,
    );
  }

  toPrimitives(): BandPrimitives {
    const bandPrimitives = {
      id: this.id.toPrimitive(),
      name: this.name,
      membersId: this.membersId.map((memberId) => {
        return memberId.toPrimitive();
      }),
      genre: this.genre,
    } as BandPrimitives;
    if (this.imageUrl) bandPrimitives.imageUrl = this.imageUrl;
    return bandPrimitives;
  }
}
