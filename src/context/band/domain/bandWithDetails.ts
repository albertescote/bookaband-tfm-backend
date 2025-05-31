import BandId from "../../shared/domain/bandId";
import { MusicGenre } from "./musicGenre";
import { BandRole } from "./bandRole";

export interface Member {
  id: string;
  userName: string;
  imageUrl?: string;
  role: BandRole;
}

export interface BandWithDetailsPrimitives {
  id: string;
  name: string;
  members: Member[];
  genre: MusicGenre;
  imageUrl?: string;
}

export default class BandWithDetails {
  constructor(
    private id: BandId,
    private name: string,
    private members: Member[],
    private genre: MusicGenre,
    private imageUrl?: string,
  ) {}

  static fromPrimitives(band: BandWithDetailsPrimitives): BandWithDetails {
    return new BandWithDetails(
      new BandId(band.id),
      band.name,
      band.members,
      band.genre,
      band.imageUrl,
    );
  }

  toPrimitives(): BandWithDetailsPrimitives {
    return {
      id: this.id.toPrimitive(),
      name: this.name,
      members: this.members,
      genre: this.genre,
      imageUrl: this.imageUrl,
    };
  }
}
