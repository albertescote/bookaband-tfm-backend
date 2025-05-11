import { Injectable } from "@nestjs/common";
import Offer from "../domain/offer";
import OfferId from "../../shared/domain/offerId";
import { OfferRepository } from "../infrastructure/offer.repository";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import { OfferNotFoundException } from "../exceptions/offerNotFoundException";
import { NotAbleToExecuteOfferDbTransactionException } from "../exceptions/notAbleToExecuteOfferDbTransactionException";
import { Role } from "../../shared/domain/role";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { OfferAlreadyExistsException } from "../exceptions/offerAlreadyExistsException";
import { OfferDetails } from "../domain/offerDetails";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { BandSize } from "../domain/bandSize";
import { NoEventTypesRegisteredException } from "../exceptions/noEventTypesRegisteredException";
import { EventTypeIdNotFoundException } from "../exceptions/eventTypeIdNotFoundException";
import BandId from "../../shared/domain/bandId";
import OfferPrice from "../domain/offerPrice";
import { EquipmentPrimitives } from "../../shared/domain/equipment";

export interface CreateOfferRequest {
  bandId: string;
  price: number;
  description: string;
  location: string;
  bandSize: BandSize;
  eventTypeIds: string[];
  visible: boolean;
}

export interface UpdateOfferRequest {
  bandId: string;
  price: number;
  description: string;
  location: string;
  bandSize: BandSize;
  eventTypeIds: string[];
  visible: boolean;
}

export interface OfferResponse {
  id: string;
  bandId: string;
  price: number;
  description: string;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  equipment: EquipmentPrimitives[];
  featured: boolean;
  visible: boolean;
}

@Injectable()
export class OfferService {
  constructor(
    private offerRepository: OfferRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  @RoleAuth([Role.Musician])
  async create(
    userAuthInfo: UserAuthInfo,
    request: CreateOfferRequest,
  ): Promise<OfferResponse> {
    await this.checkBandMembership(request.bandId, userAuthInfo.id);
    await this.checkExistingOffersForBandId(request.bandId);
    await this.checkEventTypeIds(request.eventTypeIds);
    const offer = Offer.create(
      new BandId(request.bandId),
      new OfferPrice(request.price),
      request.description,
      request.location,
      request.bandSize,
      request.eventTypeIds,
      [],
      request.visible,
    );
    const storedOffer = await this.offerRepository.addOffer(offer);
    if (!storedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(`store offer`);
    }
    return storedOffer.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async getById(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<OfferResponse> {
    const storedOffer = await this.offerRepository.getOfferById(
      new OfferId(id),
    );
    if (!storedOffer) {
      throw new OfferNotFoundException(id);
    }
    const storedOfferPrimitives = storedOffer.toPrimitives();
    await this.checkBandMembership(
      storedOfferPrimitives.bandId,
      userAuthInfo.id,
    );
    return storedOffer.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async update(
    userAuthInfo: UserAuthInfo,
    id: string,
    request: UpdateOfferRequest,
  ): Promise<OfferResponse> {
    const oldOffer = await this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    const oldOfferPrimitives = oldOffer.toPrimitives();
    await this.checkBandMembership(oldOfferPrimitives.bandId, userAuthInfo.id);
    if (oldOfferPrimitives.bandId !== request.bandId) {
      await this.checkBandMembership(request.bandId, userAuthInfo.id);
    }
    await this.checkEventTypeIds(request.eventTypeIds);
    const updatedOffer = await this.offerRepository.updateOffer(
      Offer.fromPrimitives({
        id,
        bandId: request.bandId,
        price: request.price,
        description: request.description,
        location: request.location,
        bandSize: request.bandSize,
        eventTypeIds: request.eventTypeIds,
        equipment: [],
        featured: oldOfferPrimitives.featured,
        visible: request.visible,
      }),
    );
    if (!updatedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `update offer (${id})`,
      );
    }
    return updatedOffer.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async deleteById(userAuthInfo: UserAuthInfo, id: string): Promise<void> {
    const oldOffer = await this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    await this.checkBandMembership(
      oldOffer.toPrimitives().bandId,
      userAuthInfo.id,
    );
    const deleted = await this.offerRepository.deleteOffer(new OfferId(id));
    if (!deleted) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `delete offer (${id})`,
      );
    }
    return;
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
  async getOfferDetails(_: UserAuthInfo, id: string): Promise<OfferDetails> {
    const storedOffer = await this.offerRepository.getOfferDetailsById(
      new OfferId(id),
    );
    if (!storedOffer) {
      throw new OfferNotFoundException(id);
    }
    return storedOffer;
  }

  async getAll(userId: string): Promise<OfferDetails[]> {
    const allOffers = await this.offerRepository.getAllOffersDetails();
    if (userId) return allOffers;
    return allOffers.map((offer) => {
      return {
        id: offer.id,
        bandId: offer.bandId,
        bandName: offer.bandName,
        genre: offer.genre,
        bookingDates: offer.bookingDates,
        description: offer.description,
        imageUrl: offer.imageUrl,
      };
    });
  }

  async getFeatured(userId: string): Promise<OfferDetails[]> {
    const featuredOffers =
      await this.offerRepository.getFeaturedOffersDetails();
    if (userId) return featuredOffers;
    return featuredOffers.map((featuredOffer) => {
      return {
        id: featuredOffer.id,
        bandId: featuredOffer.bandId,
        bandName: featuredOffer.bandName,
        genre: featuredOffer.genre,
        bookingDates: featuredOffer.bookingDates,
        description: featuredOffer.description,
        imageUrl: featuredOffer.imageUrl,
      };
    });
  }

  private async checkExistingOffersForBandId(bandId: string) {
    const offers = await this.offerRepository.getAllOffers();
    if (
      offers.find((offer) => {
        return offer.toPrimitives().bandId === bandId;
      })
    ) {
      throw new OfferAlreadyExistsException(bandId);
    }
  }

  private async checkBandMembership(bandId: string, userId: string) {
    const membersId = await this.moduleConnectors.obtainBandMembers(bandId);
    if (!membersId) {
      throw new BandNotFoundException(bandId);
    }
    if (
      !membersId.find((id: string) => {
        return id === userId;
      })
    ) {
      throw new WrongPermissionsException("create or update offer");
    }
  }

  private async checkEventTypeIds(eventTypeIds: string[]) {
    const allEventTypes = await this.moduleConnectors.getAllEventTypes();
    if (!allEventTypes) {
      throw new NoEventTypesRegisteredException();
    }
    const eventTypeNotFound = eventTypeIds.some((id) => {
      return !allEventTypes.find((eventType) => id === eventType.id);
    });

    if (eventTypeNotFound) {
      throw new EventTypeIdNotFoundException();
    }
  }
}
