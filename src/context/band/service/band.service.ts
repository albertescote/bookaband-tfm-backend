import { Injectable } from "@nestjs/common";
import Band, {
  HospitalityRider,
  PerformanceArea,
  TechnicalRider,
  WeeklyAvailability,
} from "../domain/band";
import BandId from "../../shared/domain/bandId";
import { BandRepository } from "../infrastructure/band.repository";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { NotAbleToExecuteBandDbTransactionException } from "../exceptions/notAbleToExecuteBandDbTransactionException";
import { Role } from "../../shared/domain/role";
import UserId from "../../shared/domain/userId";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { MemberIdNotFoundException } from "../exceptions/memberIdNotFoundException";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { BandProfile } from "../domain/bandProfile";
import { BandRole } from "../domain/bandRole";
import { AtLeastOneAdminRequiredException } from "../exceptions/atLeastOneAdminRequiredException";
import { BandNotCreatedException } from "../exceptions/bandNotCreatedException";
import { BandNotUpdatedException } from "../exceptions/bandNotUpdatedException";

export interface CreateBandRequest {
  name: string;
  musicalStyleIds: string[];
  membersId?: string[];
  imageUrl?: string;
  bio?: string;
  price: number;
  description: string;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  weeklyAvailability?: WeeklyAvailability;
  hospitalityRider?: HospitalityRider;
  technicalRider?: TechnicalRider;
  performanceArea?: PerformanceArea;
}

export interface UpdateBandRequest {
  name: string;
  musicalStyleIds: string[];
  members: { id: string; role: BandRole }[];
  imageUrl?: string;
  bio?: string;
  price: number;
  description: string;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  featured?: boolean;
  visible?: boolean;
  weeklyAvailability?: WeeklyAvailability;
  hospitalityRider?: HospitalityRider;
  technicalRider?: TechnicalRider;
  performanceArea?: PerformanceArea;
}

export interface BandResponse {
  id: string;
  name: string;
  musicalStyleIds: string[];
  members: { id: string; role: BandRole }[];
  followers: number;
  following: number;
  reviewCount: number;
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
}

export interface BandWithDetailsResponse {
  id: string;
  name: string;
  musicalStyleIds: string[];
  members: {
    id: string;
    userName: string;
    imageUrl?: string;
    role: BandRole;
  }[];
  imageUrl?: string;
}

export interface GetUserBandsResponse {
  id: string;
  name: string;
  imageUrl?: string;
}

@Injectable()
export class BandService {
  constructor(
    private bandRepository: BandRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  @RoleAuth([Role.Musician])
  async create(
    userAuthInfo: UserAuthInfo,
    createBandRequest: CreateBandRequest,
  ): Promise<BandResponse> {
    const band = Band.create(
      createBandRequest.name,
      [
        {
          id: new UserId(userAuthInfo.id),
          role: BandRole.ADMIN,
        },
      ],
      createBandRequest.musicalStyleIds,
      createBandRequest.price,
      createBandRequest.description,
      createBandRequest.location,
      createBandRequest.bandSize,
      createBandRequest.eventTypeIds,
      createBandRequest.imageUrl,
      createBandRequest.bio,
      createBandRequest.weeklyAvailability,
      createBandRequest.hospitalityRider,
      createBandRequest.technicalRider,
      createBandRequest.performanceArea,
    );

    const storedBand = await this.bandRepository.addBand(band);
    if (!storedBand) {
      throw new BandNotCreatedException();
    }

    const storedBandPrimitives = storedBand.toPrimitives();
    return {
      id: storedBandPrimitives.id,
      name: storedBandPrimitives.name,
      musicalStyleIds: storedBandPrimitives.musicalStyleIds,
      members: storedBandPrimitives.members.map((m) => ({
        id: m.id,
        role: m.role,
      })),
      followers: storedBandPrimitives.followers,
      following: storedBandPrimitives.following,
      reviewCount: storedBandPrimitives.reviewCount,
      rating: storedBandPrimitives.rating,
      imageUrl: storedBandPrimitives.imageUrl,
      bio: storedBandPrimitives.bio,
      price: storedBandPrimitives.price,
      description: storedBandPrimitives.description,
      location: storedBandPrimitives.location,
      bandSize: storedBandPrimitives.bandSize,
      eventTypeIds: storedBandPrimitives.eventTypeIds,
      featured: storedBandPrimitives.featured,
      visible: storedBandPrimitives.visible,
    };
  }

  @RoleAuth([Role.Musician])
  async getById(userAuthInfo: UserAuthInfo, id: string): Promise<BandResponse> {
    const storedBand = await this.bandRepository.getBandById(new BandId(id));
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    const storedBandPrimitives = storedBand.toPrimitives();
    if (
      !storedBandPrimitives.members.find(
        (member) => member.id === userAuthInfo.id,
      )
    ) {
      throw new WrongPermissionsException("get band");
    }
    return {
      id: storedBandPrimitives.id,
      name: storedBandPrimitives.name,
      musicalStyleIds: storedBandPrimitives.musicalStyleIds,
      members: storedBandPrimitives.members.map((m) => ({
        id: m.id,
        role: m.role,
      })),
      followers: storedBandPrimitives.followers,
      following: storedBandPrimitives.following,
      reviewCount: storedBandPrimitives.reviewCount,
      rating: storedBandPrimitives.rating,
      imageUrl: storedBandPrimitives.imageUrl,
      bio: storedBandPrimitives.bio,
      price: storedBandPrimitives.price,
      description: storedBandPrimitives.description,
      location: storedBandPrimitives.location,
      bandSize: storedBandPrimitives.bandSize,
      eventTypeIds: storedBandPrimitives.eventTypeIds,
      featured: storedBandPrimitives.featured,
      visible: storedBandPrimitives.visible,
    };
  }

  @RoleAuth([Role.Musician])
  async getDetailsById(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<BandWithDetailsResponse> {
    const storedBand = await this.bandRepository.getBandWithDetailsById(
      new BandId(id),
    );
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    const storedBandPrimitives = storedBand.toPrimitives();
    if (
      !storedBandPrimitives.members.find(
        (member) => member.id === userAuthInfo.id,
      )
    ) {
      throw new WrongPermissionsException("get band");
    }
    return {
      id: storedBandPrimitives.id,
      name: storedBandPrimitives.name,
      musicalStyleIds: storedBandPrimitives.musicalStyleIds,
      members: storedBandPrimitives.members.map((m) => ({
        id: m.id,
        userName: m.userName,
        imageUrl: m.imageUrl,
        role: m.role,
      })),
      imageUrl: storedBandPrimitives.imageUrl,
    };
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
  async getViewById(_: UserAuthInfo, id: string): Promise<BandResponse> {
    const storedBand = await this.bandRepository.getBandById(new BandId(id));
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    return storedBand.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async getUserBands(
    userAuthInfo: UserAuthInfo,
  ): Promise<GetUserBandsResponse[]> {
    return await this.bandRepository.getUserBands(new UserId(userAuthInfo.id));
  }

  @RoleAuth([Role.Musician])
  async update(
    userAuthInfo: UserAuthInfo,
    id: string,
    updateBandRequest: UpdateBandRequest,
  ): Promise<BandResponse> {
    const storedBand = await this.bandRepository.getBandById(new BandId(id));
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    const storedBandPrimitives = storedBand.toPrimitives();
    if (
      !storedBandPrimitives.members.find(
        (member) => member.id === userAuthInfo.id,
      )
    ) {
      throw new WrongPermissionsException("update band");
    }

    const updatedBand = Band.fromPrimitives({
      ...storedBandPrimitives,
      name: updateBandRequest.name,
      musicalStyleIds: updateBandRequest.musicalStyleIds,
      members: updateBandRequest.members,
      price: updateBandRequest.price,
      description: updateBandRequest.description,
      location: updateBandRequest.location,
      bandSize: updateBandRequest.bandSize,
      eventTypeIds: updateBandRequest.eventTypeIds,
      imageUrl: updateBandRequest.imageUrl,
      bio: updateBandRequest.bio,
      featured: updateBandRequest.featured,
      visible: updateBandRequest.visible,
      weeklyAvailability: updateBandRequest.weeklyAvailability,
      hospitalityRider: updateBandRequest.hospitalityRider,
      technicalRider: updateBandRequest.technicalRider,
      performanceArea: updateBandRequest.performanceArea,
    });

    const storedUpdatedBand = await this.bandRepository.updateBand(updatedBand);
    if (!storedUpdatedBand) {
      throw new BandNotUpdatedException();
    }

    const storedUpdatedBandPrimitives = storedUpdatedBand.toPrimitives();
    return {
      id: storedUpdatedBandPrimitives.id,
      name: storedUpdatedBandPrimitives.name,
      musicalStyleIds: storedUpdatedBandPrimitives.musicalStyleIds,
      members: storedUpdatedBandPrimitives.members.map((m) => ({
        id: m.id,
        role: m.role,
      })),
      followers: storedUpdatedBandPrimitives.followers,
      following: storedUpdatedBandPrimitives.following,
      reviewCount: storedUpdatedBandPrimitives.reviewCount,
      rating: storedUpdatedBandPrimitives.rating,
      imageUrl: storedUpdatedBandPrimitives.imageUrl,
      bio: storedUpdatedBandPrimitives.bio,
      price: storedUpdatedBandPrimitives.price,
      description: storedUpdatedBandPrimitives.description,
      location: storedUpdatedBandPrimitives.location,
      bandSize: storedUpdatedBandPrimitives.bandSize,
      eventTypeIds: storedUpdatedBandPrimitives.eventTypeIds,
      featured: storedUpdatedBandPrimitives.featured,
      visible: storedUpdatedBandPrimitives.visible,
    };
  }

  @RoleAuth([Role.Musician])
  async deleteById(userAuthInfo: UserAuthInfo, id: string): Promise<void> {
    const oldBand = await this.bandRepository.getBandById(new BandId(id));
    if (!oldBand) {
      throw new BandNotFoundException(id);
    }

    if (!oldBand.isAdmin(new UserId(userAuthInfo.id))) {
      throw new WrongPermissionsException(
        "delete band - only admins can delete the band",
      );
    }
    const deleted = await this.bandRepository.deleteBand(new BandId(id));
    if (!deleted) {
      throw new NotAbleToExecuteBandDbTransactionException(
        `delete band (${id})`,
      );
    }
    return;
  }

  async getBandProfile(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<BandProfile> {
    const bandId = new BandId(id);
    const bandProfile = await this.bandRepository.getBandProfileById(bandId);
    if (!bandProfile) {
      throw new BandNotFoundException(id);
    }
    const { price, ...shaped } = bandProfile;
    return userAuthInfo.id ? bandProfile : shaped;
  }

  private async checkMembersIdExistence(
    membersId: string[],
    userId: string,
  ): Promise<UserId[]> {
    if (!membersId || membersId.length === 0) {
      return [new UserId(userId)];
    }
    let members: UserId[] = [];
    for (const memberId of membersId) {
      const user = await this.moduleConnectors.obtainUserInformation(memberId);
      if (!user) {
        throw new MemberIdNotFoundException(memberId);
      }
      members.push(user.getId());
    }
    if (!members.find((member) => member.toPrimitive() === userId)) {
      members.push(new UserId(userId));
    }
    return members;
  }

  private async checkAtLeastOneAdmin(
    members: { id: string; role: BandRole }[],
  ) {
    const admins = members.filter((member) => member.role === BandRole.ADMIN);
    if (admins.length === 0) {
      throw new AtLeastOneAdminRequiredException();
    }
    return;
  }
}
