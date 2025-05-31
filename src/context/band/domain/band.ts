import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { BandRole } from "./bandRole";
import { BandMember } from "./bandMember";

export interface WeeklyAvailability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface HospitalityRider {
  accommodation: string;
  catering: string;
  beverages: string;
  specialRequirements: string;
}

export interface TechnicalRider {
  soundSystem: string;
  microphones: string;
  backline: string;
  lighting: string;
  otherRequirements: string;
}

export interface PerformanceArea {
  regions: string[];
  travelPreferences: string[];
  restrictions: string[];
}

export interface BandPrimitives {
  id: string;
  name: string;
  members: { id: string; role: BandRole }[];
  musicalStyleIds: string[];
  reviewCount: number;
  followers: number;
  following: number;
  createdAt: Date;
  rating?: number;
  imageUrl?: string;
  bio?: string;
  price: number;
  description: string;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  featured: boolean;
  visible: boolean;
  weeklyAvailability: WeeklyAvailability;
  hospitalityRider?: HospitalityRider;
  technicalRider?: TechnicalRider;
  performanceArea?: PerformanceArea;
}

export default class Band {
  constructor(
    private id: BandId,
    private name: string,
    private members: BandMember[],
    private musicalStyleIds: string[],
    private followers: number,
    private following: number,
    private createdAt: Date,
    private price: number,
    private description: string,
    private location: string,
    private bandSize: string,
    private eventTypeIds: string[],
    private featured: boolean = false,
    private visible: boolean = true,
    private weeklyAvailability: WeeklyAvailability = {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    private hospitalityRider?: HospitalityRider | undefined,
    private technicalRider?: TechnicalRider | undefined,
    private performanceArea?: PerformanceArea | undefined,
    private reviewCount: number = 0,
    private imageUrl?: string | undefined,
    private rating?: number | undefined,
    private bio?: string | undefined,
  ) {}

  static create(
    name: string,
    members: BandMember[],
    musicalStyleIds: string[],
    price: number,
    description: string,
    location: string,
    bandSize: string,
    eventTypeIds: string[],
    imageUrl?: string,
    bio?: string,
    weeklyAvailability?: WeeklyAvailability,
    hospitalityRider?: HospitalityRider,
    technicalRider?: TechnicalRider,
    performanceArea?: PerformanceArea,
  ): Band {
    return new Band(
      BandId.generate(),
      name,
      members,
      musicalStyleIds,
      0,
      0,
      new Date(),
      price,
      description,
      location,
      bandSize,
      eventTypeIds,
      false,
      true,
      weeklyAvailability,
      hospitalityRider,
      technicalRider,
      performanceArea,
      0,
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
      primitives.musicalStyleIds,
      primitives.followers,
      primitives.following,
      primitives.createdAt,
      primitives.price,
      primitives.description,
      primitives.location,
      primitives.bandSize,
      primitives.eventTypeIds,
      primitives.featured,
      primitives.visible,
      primitives.weeklyAvailability,
      primitives.hospitalityRider,
      primitives.technicalRider,
      primitives.performanceArea,
      primitives.reviewCount,
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
      musicalStyleIds: this.musicalStyleIds,
      reviewCount: this.reviewCount,
      followers: this.followers,
      following: this.following,
      createdAt: this.createdAt,
      imageUrl: this.imageUrl,
      rating: this.rating,
      bio: this.bio,
      price: this.price,
      description: this.description,
      location: this.location,
      bandSize: this.bandSize,
      eventTypeIds: this.eventTypeIds,
      featured: this.featured,
      visible: this.visible,
      weeklyAvailability: this.weeklyAvailability,
      hospitalityRider: this.hospitalityRider,
      technicalRider: this.technicalRider,
      performanceArea: this.performanceArea,
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

  updateWeeklyAvailability(availability: WeeklyAvailability) {
    this.weeklyAvailability = availability;
  }

  updateRiders(hospitalityRider?: HospitalityRider, technicalRider?: TechnicalRider) {
    if (hospitalityRider !== undefined) {
      this.hospitalityRider = hospitalityRider;
    }
    if (technicalRider !== undefined) {
      this.technicalRider = technicalRider;
    }
  }

  updatePerformanceArea(performanceArea: PerformanceArea) {
    this.performanceArea = performanceArea;
  }
}
