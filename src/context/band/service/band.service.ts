import { Injectable } from "@nestjs/common";
import Band from "../domain/band";
import BandId from "../../shared/domain/bandId";
import { BandRepository } from "../infrastructure/band.repository";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { NotAbleToExecuteBandDbTransactionException } from "../exceptions/notAbleToExecuteBandDbTransactionException";
import { Role } from "../../shared/domain/role";
import UserId from "../../shared/domain/userId";
import { MusicGenre } from "../domain/musicGenre";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { MemberIdNotFoundException } from "../exceptions/memberIdNotFoundException";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { BandProfile } from "../domain/bandProfile";
import { BandRole } from "../domain/bandRole";
import { AtLeastOneAdminRequiredException } from "../exceptions/atLeastOneAdminRequiredException";

export interface CreateBandRequest {
  name: string;
  genre: MusicGenre;
  membersId?: string[];
  imageUrl?: string;
  bio?: string;
}

export interface UpdateBandRequest {
  name: string;
  genre: MusicGenre;
  members: { id: string; role: BandRole }[];
  imageUrl?: string;
  bio?: string;
}

export interface BandResponse {
  id: string;
  name: string;
  genre: MusicGenre;
  members: { id: string; role: BandRole }[];
  followers: number;
  following: number;
  reviewCount: number;
  rating?: number;
  imageUrl?: string;
  bio?: string;
}

export interface BandWithDetailsResponse {
  id: string;
  name: string;
  genre: MusicGenre;
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
    request: CreateBandRequest,
  ): Promise<BandResponse> {
    const membersId: UserId[] = await this.checkMembersIdExistence(
      request.membersId,
      userAuthInfo.id,
    );
    const band = Band.create(
      request.name,
      membersId.map((userId) => {
        if (userId.toPrimitive() === userAuthInfo.id) {
          return { id: userId, role: BandRole.ADMIN };
        }
        return { id: userId, role: BandRole.MEMBER };
      }),
      request.genre,
      request.imageUrl,
      request.bio,
    );
    const storedBand = await this.bandRepository.addBand(band);
    if (!storedBand) {
      throw new NotAbleToExecuteBandDbTransactionException(`store band`);
    }
    return storedBand.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async getById(userAuthInfo: UserAuthInfo, id: string): Promise<BandResponse> {
    const storedBand = await this.bandRepository.getBandById(new BandId(id));
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    const storedBandPrimitives = storedBand.toPrimitives();
    if (!storedBandPrimitives.members.find((m) => m.id === userAuthInfo.id)) {
      throw new WrongPermissionsException("get band");
    }
    return storedBandPrimitives;
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
      genre: storedBandPrimitives.genre,
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
    request: UpdateBandRequest,
  ): Promise<BandResponse> {
    const oldBand = await this.bandRepository.getBandById(new BandId(id));
    if (!oldBand) {
      throw new BandNotFoundException(id);
    }

    if (!oldBand.isAdmin(new UserId(userAuthInfo.id))) {
      throw new WrongPermissionsException(
        "update band - only admins can update band details",
      );
    }

    await this.checkMembersIdExistence(
      request.members.map((member) => member.id),
      userAuthInfo.id,
    );
    await this.checkAtLeastOneAdmin(request.members);
    const oldBandPrimitives = oldBand.toPrimitives();
    const updatedBand = await this.bandRepository.updateBand(
      new Band(
        new BandId(id),
        request.name,
        request.members.map((member) => ({
          id: new UserId(member.id),
          role: member.role,
        })),
        request.genre,
        oldBandPrimitives.reviewCount,
        oldBandPrimitives.followers,
        oldBandPrimitives.following,
        oldBandPrimitives.createdAt,
        request.imageUrl,
        oldBandPrimitives.rating,
        request.bio,
      ),
    );
    if (!updatedBand) {
      throw new NotAbleToExecuteBandDbTransactionException(
        `update band (${id})`,
      );
    }
    return updatedBand.toPrimitives();
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
