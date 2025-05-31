import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { MusicGenre } from "./musicGenre";
import { BandRole } from "./bandRole";
import { BandMember } from "./bandMember";

export interface BandPrimitives {
  id: string;
  name: string;
  members: { id: string; role: BandRole }[];
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
    private members: BandMember[],
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
    members: BandMember[],
    genre: MusicGenre,
    imageUrl?: string,
    bio?: string,
  ): Band {
    return new Band(
      BandId.generate(),
      name,
      members,
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
      primitives.members.map((member) => ({
        id: new UserId(member.id),
        role: member.role,
      })),
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
      members: this.members.map((member) => ({
        id: member.id.toPrimitive(),
        role: member.role,
      })),
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

  addMember(newMemberId: UserId, role: BandRole = BandRole.MEMBER) {
    this.members.push({ id: newMemberId, role });
  }

  removeMember(memberId: UserId) {
    this.members = this.members.filter(
      (member) => member.id.toPrimitive() !== memberId.toPrimitive(),
    );
  }

  getMemberRole(memberId: UserId): BandRole | undefined {
    const member = this.members.find(
      (m) => m.id.toPrimitive() === memberId.toPrimitive(),
    );
    return member?.role;
  }

  isAdmin(memberId: UserId): boolean {
    return this.getMemberRole(memberId) === BandRole.ADMIN;
  }

  getMembersId(): string[] {
    return this.members.map((member) => member.id.toPrimitive());
  }
}
