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

export interface BandRequest {
  name: string;
  genre: MusicGenre;
  membersId?: string[];
  imageUrl?: string;
}

export interface BandResponse {
  id: string;
  name: string;
  genre: MusicGenre;
  membersId: string[];
  imageUrl?: string;
}

export interface BandWithDetailsResponse {
  id: string;
  name: string;
  genre: MusicGenre;
  members: {
    id: string;
    userName: string;
    imageUrl?: string;
  }[];
  imageUrl?: string;
}

export interface GetUserBandsResponse {
  id: string;
  name: string;
  offer?: {
    id: string;
    bandId: string;
    price: number;
    description?: string;
  };
}

@Injectable()
export class BandService {
  constructor(
    private bandRepository: BandRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async create(
    request: BandRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<BandResponse> {
    if (userAuthInfo.role !== Role.Musician) {
      throw new WrongPermissionsException("create band");
    }
    const membersId: UserId[] = await this.checkMembersIdExistence(
      request.membersId,
      userAuthInfo.id,
    );
    const band = new Band(
      BandId.generate(),
      request.name,
      membersId,
      request.genre,
      request.imageUrl,
    );
    const storedBand = await this.bandRepository.addBand(band);
    if (!storedBand) {
      throw new NotAbleToExecuteBandDbTransactionException(`store band`);
    }
    return storedBand.toPrimitives();
  }

  async getById(id: string, userAuthInfo: UserAuthInfo): Promise<BandResponse> {
    const storedBand = await this.bandRepository.getBandById(new BandId(id));
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    const storedBandPrimitives = storedBand.toPrimitives();
    if (!storedBandPrimitives.membersId.find((id) => id === userAuthInfo.id)) {
      throw new WrongPermissionsException("get band");
    }
    return storedBandPrimitives;
  }

  async getDetailsById(
    id: string,
    userAuthInfo: UserAuthInfo,
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
    return storedBandPrimitives;
  }

  async getViewById(id: string): Promise<BandResponse> {
    const storedBand = await this.bandRepository.getBandById(new BandId(id));
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    return storedBand.toPrimitives();
  }

  async getUserBands(
    userAuthInfo: UserAuthInfo,
  ): Promise<GetUserBandsResponse[]> {
    return await this.bandRepository.getUserBands(new UserId(userAuthInfo.id));
  }

  async update(
    id: string,
    request: BandRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<BandResponse> {
    const oldBand = await this.bandRepository.getBandById(new BandId(id));
    if (!oldBand) {
      throw new BandNotFoundException(id);
    }
    if (
      !oldBand.toPrimitives().membersId.find((id) => id === userAuthInfo.id)
    ) {
      throw new WrongPermissionsException("get band");
    }
    const membersId: UserId[] = await this.checkMembersIdExistence(
      request.membersId,
      userAuthInfo.id,
    );
    const updatedBand = await this.bandRepository.updateBand(
      new Band(
        new BandId(id),
        request.name,
        membersId,
        request.genre,
        request.imageUrl,
      ),
    );
    if (!updatedBand) {
      throw new NotAbleToExecuteBandDbTransactionException(
        `update band (${id})`,
      );
    }
    return updatedBand.toPrimitives();
  }

  async deleteById(id: string, userAuthInfo: UserAuthInfo): Promise<void> {
    const oldBand = await this.bandRepository.getBandById(new BandId(id));
    if (!oldBand) {
      throw new BandNotFoundException(id);
    }
    if (
      !oldBand.toPrimitives().membersId.find((id) => id === userAuthInfo.id)
    ) {
      throw new WrongPermissionsException("get band");
    }
    const deleted = await this.bandRepository.deleteBand(new BandId(id));
    if (!deleted) {
      throw new NotAbleToExecuteBandDbTransactionException(
        `delete band (${id})`,
      );
    }
    return;
  }

  private async checkMembersIdExistence(membersId: string[], userId: string) {
    if (!membersId) {
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
}
