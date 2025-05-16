import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { MusicGenre } from "./musicGenre";

export interface BandPrimitives {
  id: string;
  name: string;
  membersId: string[];
  genre: MusicGenre;
  reviewCount: number;
  followers: number;
  following: number;
  createdAt: Date;
  rating?: number;
  imageUrl?: string;
  bio?: string;
}

export default class Band {
  constructor(
    private id: BandId,
    private name: string,
    private membersId: UserId[],
    private genre: MusicGenre,
    private reviewCount: number,
    private followers: number,
    private following: number,
    private createdAt: Date,
    private imageUrl?: string | undefined,
    private rating?: number | undefined,
    private bio?: string | undefined,
  ) {}

  static create(
    name: string,
    membersId: UserId[],
    genre: MusicGenre,
    imageUrl?: string,
    bio?: string,
  ): Band {
    return new Band(
      BandId.generate(),
      name,
      membersId,
      genre,
      0,
      0,
      0,
      new Date(),
      imageUrl,
      undefined,
      bio,
    );
  }

  static fromPrimitives(primitives: BandPrimitives): Band {
    return new Band(
      new BandId(primitives.id),
      primitives.name,
      primitives.membersId.map((id) => new UserId(id)),
      primitives.genre,
      primitives.reviewCount,
      primitives.followers,
      primitives.following,
      primitives.createdAt,
      primitives.imageUrl,
      primitives.rating,
      primitives.bio,
    );
  }

  toPrimitives(): BandPrimitives {
    return {
      id: this.id.toPrimitive(),
      name: this.name,
      membersId: this.membersId.map((id) => id.toPrimitive()),
      genre: this.genre,
      reviewCount: this.reviewCount,
      followers: this.followers,
      following: this.following,
      createdAt: this.createdAt,
      imageUrl: this.imageUrl,
      rating: this.rating,
      bio: this.bio,
    };
  }

  addMember(newMemberId: UserId) {
    this.membersId.push(newMemberId);
  }
}
