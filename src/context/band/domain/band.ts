import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { MusicGenre } from "./musicGenre";
import { Equipment, EquipmentPrimitives } from "../../shared/domain/equipment";
import { BandSize } from "./bandSize";
import { InvalidBandSizeException } from "../exceptions/invalidBandSizeException";

export interface BandPrimitives {
  id: string;
  name: string;
  membersId: string[];
  genre: MusicGenre;
  location: string;
  reviewCount: number;
  featured: boolean;
  bandSize: string;
  eventTypeIds: string[];
  equipment: EquipmentPrimitives[];
  rating?: number;
  imageUrl?: string;
}

export default class Band {
  constructor(
    private id: BandId,
    private name: string,
    private membersId: UserId[],
    private genre: MusicGenre,
    private location: string,
    private reviewCount: number,
    private featured: boolean,
    private bandSize: BandSize,
    private eventTypeIds: string[],
    private equipment: Equipment[],
    private imageUrl?: string | undefined,
    private rating?: number | undefined,
  ) {}

  static create(
    name: string,
    membersId: UserId[],
    genre: MusicGenre,
    location: string,
    bandSize: BandSize,
    eventTypeIds: string[],
    equipment: Equipment[],
    imageUrl: string,
  ): Band {
    return new Band(
      BandId.generate(),
      name,
      membersId,
      genre,
      location,
      0,
      false,
      bandSize,
      eventTypeIds,
      equipment,
      imageUrl,
    );
  }

  static fromPrimitives(primitives: BandPrimitives): Band {
    const bandSize: BandSize = BandSize[primitives.bandSize];
    if (bandSize) {
      throw new InvalidBandSizeException(primitives.bandSize);
    }
    return new Band(
      new BandId(primitives.id),
      primitives.name,
      primitives.membersId.map((id) => new UserId(id)),
      primitives.genre,
      primitives.location,
      primitives.reviewCount,
      primitives.featured,
      bandSize,
      primitives.eventTypeIds,
      primitives.equipment.map(Equipment.fromPrimitives),
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
      location: this.location,
      reviewCount: this.reviewCount,
      featured: this.featured,
      bandSize: this.bandSize,
      eventTypeIds: this.eventTypeIds,
      equipment: this.equipment.map((equipment) => equipment.toPrimitives()),
      imageUrl: this.imageUrl,
      rating: this.rating,
    };
  }

  addMember(newMemberId: UserId) {
    this.membersId.push(newMemberId);
  }
}
