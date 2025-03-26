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

export interface CreateOfferRequest {
  bandId: string;
  price: number;
  visible: boolean;
  description?: string;
}

export interface UpdateOfferRequest {
  bandId: string;
  price: number;
  visible: boolean;
  description?: string;
}

export interface OfferResponse {
  id: string;
  price: number;
  bandId: string;
  visible: boolean;
  description?: string;
}

@Injectable()
export class OfferService {
  constructor(
    private offerRepository: OfferRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async create(
    request: CreateOfferRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<OfferResponse> {
    if (userAuthInfo.role !== Role.Musician) {
      throw new WrongPermissionsException("create offer");
    }
    await this.checkBandMembership(request.bandId, userAuthInfo.id);
    await this.checkExistingOffersForBandId(request.bandId);
    const offer = Offer.create(
      request.bandId,
      request.price,
      request.description,
      request.visible,
    );
    const storedOffer = await this.offerRepository.addOffer(offer);
    if (!storedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(`store offer`);
    }
    return storedOffer.toPrimitives();
  }

  async getById(
    id: string,
    userAuthInfo: UserAuthInfo,
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

  async update(
    id: string,
    request: UpdateOfferRequest,
    userAuthInfo: UserAuthInfo,
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
    const updatedOffer = await this.offerRepository.updateOffer(
      Offer.fromPrimitives({
        id,
        bandId: request.bandId,
        price: request.price,
        description: request.description,
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

  async deleteById(id: string, userAuthInfo: UserAuthInfo): Promise<void> {
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

  async getOfferDetails(id: string): Promise<OfferDetails> {
    const storedOffer = await this.offerRepository.getOfferDetailsById(
      new OfferId(id),
    );
    if (!storedOffer) {
      throw new OfferNotFoundException(id);
    }
    return storedOffer;
  }

  async getAll(): Promise<OfferDetails[]> {
    return await this.offerRepository.getAllOffersDetails();
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
}
