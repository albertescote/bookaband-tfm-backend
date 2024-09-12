import { Injectable } from "@nestjs/common";
import Offer from "../domain/offer";
import OfferId from "../domain/offerId";
import { OfferRepository } from "../infrastructure/offerRepository";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import { OfferNotFoundException } from "../exceptions/offerNotFoundException";
import { NotAbleToExecuteOfferDbTransactionException } from "../exceptions/notAbleToExecuteOfferDbTransactionException";
import { Role } from "../../shared/domain/role";
import UserId from "../../shared/domain/userId";
import OfferPrice from "../domain/offerPrice";

export interface OfferRequest {
  description: string;
  price: number;
}

export interface CreateOfferResponse {
  id: string;
  description: string;
  price: number;
}

export interface OfferResponse {
  id: string;
  description: string;
  price: number;
}

@Injectable()
export class OfferService {
  constructor(private offerRepository: OfferRepository) {}

  async create(
    request: OfferRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<CreateOfferResponse> {
    if (userAuthInfo.role !== Role.Musician) {
      throw new WrongPermissionsException("create offer");
    }
    const offer = new Offer(
      OfferId.generate(),
      request.description,
      new UserId(userAuthInfo.id),
      new OfferPrice(request.price),
    );
    const storedOffer = this.offerRepository.addOffer(offer);
    if (!storedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(`store offer`);
    }
    const offerPrimitives = storedOffer.toPrimitives();
    return {
      id: offerPrimitives.id,
      description: offerPrimitives.description,
      price: offerPrimitives.price,
    };
  }

  getById(id: string, userAuthInfo: UserAuthInfo): OfferResponse {
    const storedOffer = this.offerRepository.getOfferById(new OfferId(id));
    if (!storedOffer) {
      throw new OfferNotFoundException(id);
    }
    if (storedOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException("get offer");
    }
    if (storedOffer) return storedOffer.toPrimitives();
  }

  getAll(): OfferResponse[] {
    return this.offerRepository.getAllOffers().map((offer) => {
      const primitives = offer.toPrimitives();
      return {
        id: primitives.id,
        description: primitives.description,
        price: primitives.price,
      };
    });
  }

  async update(
    id: string,
    request: OfferRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<OfferResponse> {
    const oldOffer = this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    if (oldOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException("update offer");
    }
    const updatedOffer = this.offerRepository.updateOffer(
      new OfferId(id),
      Offer.fromPrimitives({
        ...request,
        id,
        ownerId: userAuthInfo.id,
      }),
    );
    if (!updatedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `update offer (${id})`,
      );
    }
    const primitives = updatedOffer.toPrimitives();
    return {
      id: primitives.id,
      description: primitives.description,
      price: primitives.price,
    };
  }

  deleteById(id: string, userAuthInfo: UserAuthInfo): void {
    const oldOffer = this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    if (oldOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException("delete offer");
    }
    const deleted = this.offerRepository.deleteOffer(new OfferId(id));
    if (!deleted) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `delete offer (${id})`,
      );
    }
    return;
  }
}
