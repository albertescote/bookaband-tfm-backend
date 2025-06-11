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
import { InvalidEventTypeIdException } from "../exceptions/invalidEventTypeIdException";
import { InvalidMusicalStyleIdException } from "../exceptions/invalidMusicalStyleIdException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { UserNotFoundException } from "../exceptions/userNotFoundException";
import { MissingUserInfoToCreateBandException } from "../exceptions/missingUserInfoToCreateBandException";

export interface UpsertBandRequest {
  name: string;
  musicalStyleIds: string[];
  price: number;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  weeklyAvailability: WeeklyAvailability;
  hospitalityRider: HospitalityRider;
  technicalRider: TechnicalRider;
  performanceArea: PerformanceArea;
  media?: { url: string; type: string }[];
  socialLinks?: { platform: string; url: string }[];
  bio?: string;
  imageUrl?: string;
  visible?: boolean;
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
  constructor(
    private bandRepository: BandRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  @RoleAuth([Role.Musician])
  async create(
    userAuthInfo: UserAuthInfo,
    createBandRequest: UpsertBandRequest,
  ): Promise<void> {
    await this.validateIds(
      createBandRequest.eventTypeIds,
      createBandRequest.musicalStyleIds,
    );

    const user = await this.moduleConnectors.obtainUserInformation(
      userAuthInfo.id,
    );
    if (!user) {
      throw new UserNotFoundException(userAuthInfo.id);
    }
    if (!user.hasAllInfo()) {
      throw new MissingUserInfoToCreateBandException();
    }

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
      createBandRequest.weeklyAvailability,
      createBandRequest.hospitalityRider,
      createBandRequest.technicalRider,
      createBandRequest.performanceArea,
      createBandRequest.media,
      createBandRequest.socialLinks,
      createBandRequest.imageUrl,
      createBandRequest.bio,
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
      imageUrl: storedBandPrimitives.imageUrl,
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
    await this.validateIds(
      updateBandRequest.eventTypeIds,
      updateBandRequest.musicalStyleIds,
    );

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
      media: updateBandRequest.media,
      socialLinks: updateBandRequest.socialLinks,
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

  private async validateIds(
    eventTypeIds: string[],
    musicalStyleIds: string[],
  ): Promise<void> {
    const [eventTypes, musicalStyles] = await Promise.all([
      this.moduleConnectors.getAllEventTypes(),
      this.moduleConnectors.getAllMusicalStyles(),
    ]);

    const validEventTypeIds = new Set(eventTypes.map((et) => et.id));
    const validMusicalStyleIds = new Set(musicalStyles.map((ms) => ms.id));

    const invalidEventTypeIds = eventTypeIds.filter(
      (id) => !validEventTypeIds.has(id),
    );
    const invalidMusicalStyleIds = musicalStyleIds.filter(
      (id) => !validMusicalStyleIds.has(id),
    );

    if (invalidEventTypeIds.length > 0) {
      throw new InvalidEventTypeIdException(invalidEventTypeIds);
    }

    if (invalidMusicalStyleIds.length > 0) {
      throw new InvalidMusicalStyleIdException(invalidMusicalStyleIds);
    }
  }
}
