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
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { BandRole } from "../domain/bandRole";
import { BandNotCreatedException } from "../exceptions/bandNotCreatedException";
import { BandNotUpdatedException } from "../exceptions/bandNotUpdatedException";

export interface UpsertBandRequest {
  name: string;
  musicalStyleIds: string[];
  price: number;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  bio?: string;
  imageUrl?: string;
  visible?: boolean;
  weeklyAvailability?: WeeklyAvailability;
  hospitalityRider?: HospitalityRider;
  technicalRider?: TechnicalRider;
  performanceArea?: PerformanceArea;
}

export interface BandResponse {
  id: string;
  name: string;
  members: { id: string; role: BandRole }[];
  musicalStyleIds: string[];
  imageUrl?: string;
  bio?: string;
}

export interface GetUserBandsResponse {
  id: string;
  name: string;
  imageUrl?: string;
}

@Injectable()
export class BandService {
  constructor(private bandRepository: BandRepository) {}

  @RoleAuth([Role.Musician])
  async create(
    userAuthInfo: UserAuthInfo,
    createBandRequest: UpsertBandRequest,
  ): Promise<void> {
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
  }

  @RoleAuth([Role.Musician, Role.Client])
  async getById(_: UserAuthInfo, id: string): Promise<BandResponse> {
    const storedBand = await this.bandRepository.getBandById(new BandId(id));
    if (!storedBand) {
      throw new BandNotFoundException(id);
    }
    const storedBandPrimitives = storedBand.toPrimitives();
    return {
      id: storedBandPrimitives.id,
      name: storedBandPrimitives.name,
      musicalStyleIds: storedBandPrimitives.musicalStyleIds,
      members: storedBandPrimitives.members,
      bio: storedBandPrimitives.bio,
    };
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
    updateBandRequest: UpsertBandRequest,
  ): Promise<void> {
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
      price: updateBandRequest.price,
      location: updateBandRequest.location,
      bandSize: updateBandRequest.bandSize,
      eventTypeIds: updateBandRequest.eventTypeIds,
      imageUrl: updateBandRequest.imageUrl,
      bio: updateBandRequest.bio,
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
}
