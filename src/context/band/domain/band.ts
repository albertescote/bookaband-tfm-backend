import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { MusicGenre } from "./musicGenre";

export interface BandPrimitives {
  id: string;
  name: string;
  membersId: string[];
  genre: MusicGenre;
  reviewCount: number;
  rating?: number;
  imageUrl?: string;
}

export default class Band {
  constructor(
    private id: BandId,
    private name: string,
    private membersId: UserId[],
    private genre: MusicGenre,
    private reviewCount: number,
    private imageUrl?: string | undefined,
    private rating?: number | undefined,
  ) {}

  static create(
    name: string,
    membersId: UserId[],
    genre: MusicGenre,
    imageUrl: string,
  ): Band {
    return new Band(BandId.generate(), name, membersId, genre, 0, imageUrl);
  }

  static fromPrimitives(primitives: BandPrimitives): Band {
    return new Band(
      new BandId(primitives.id),
      primitives.name,
      primitives.membersId.map((id) => new UserId(id)),
      primitives.genre,
      primitives.reviewCount,
      primitives.imageUrl,
      primitives.rating,
    );
  }

  toPrimitives(): BandPrimitives {
    return {
      id: this.id.toPrimitive(),
      name: this.name,
      membersId: this.membersId.map((id) => id.toPrimitive()),
      genre: this.genre,
      reviewCount: this.reviewCount,
      imageUrl: this.imageUrl,
      rating: this.rating,
    };
  }

  addMember(newMemberId: UserId) {
    this.membersId.push(newMemberId);
  }
}
