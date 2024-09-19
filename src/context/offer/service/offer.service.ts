import { Injectable } from "@nestjs/common";
import Offer from "../domain/offer";
import OfferId from "../domain/offerId";
import { OfferRepository } from "../infrastructure/offer.repository";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import { OfferNotFoundException } from "../exceptions/offerNotFoundException";
import { NotAbleToExecuteOfferDbTransactionException } from "../exceptions/notAbleToExecuteOfferDbTransactionException";
import { Role } from "../../shared/domain/role";
import UserId from "../../shared/domain/userId";
import OfferPrice from "../domain/offerPrice";
import { MusicGenre } from "../domain/musicGenre";

export interface OfferRequest {
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

export interface CreateOfferResponse {
  id: string;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

export interface GetOfferResponse {
  id: string;
  ownerId: string;
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

export interface GetAllOfferResponse {
  id: string;
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

export interface UpdateOfferResponse {
  id: string;
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
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
      new UserId(userAuthInfo.id),
      new OfferPrice(request.price),
      request.bandName,
      request.genre,
      request.description,
      request.imageUrl,
    );
    const storedOffer = await this.offerRepository.addOffer(offer);
    if (!storedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(`store offer`);
    }
    const offerPrimitives = storedOffer.toPrimitives();
    delete offerPrimitives.ownerId;
    return offerPrimitives;
  }

  async getById(
    id: string,
    userAuthInfo: UserAuthInfo,
  ): Promise<GetOfferResponse> {
    const storedOffer = await this.offerRepository.getOfferById(
      new OfferId(id),
    );
    if (!storedOffer) {
      throw new OfferNotFoundException(id);
    }
    if (storedOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException("get offer");
    }
    if (storedOffer) return storedOffer.toPrimitives();
  }

  async getAll(): Promise<GetAllOfferResponse[]> {
    const offers = await this.offerRepository.getAllOffers();
    return offers.map((offer) => {
      const primitives = offer.toPrimitives();
      delete primitives.ownerId;
      return primitives;
    });
  }

  async update(
    id: string,
    request: OfferRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<UpdateOfferResponse> {
    const oldOffer = await this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    if (oldOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException("update offer");
    }
    const updatedOffer = await this.offerRepository.updateOffer(
      new OfferId(id),
      Offer.fromPrimitives({
        id,
        ownerId: userAuthInfo.id,
        price: request.price,
        bandName: request.bandName,
        genre: request.genre,
        description: request.description,
        imageUrl: request.imageUrl,
      }),
    );
    if (!updatedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `update offer (${id})`,
      );
    }
    const primitives = updatedOffer.toPrimitives();
    delete primitives.ownerId;
    return primitives;
  }

  async deleteById(id: string, userAuthInfo: UserAuthInfo): Promise<void> {
    const oldOffer = await this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    if (oldOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException("delete offer");
    }
    const deleted = await this.offerRepository.deleteOffer(new OfferId(id));
    if (!deleted) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `delete offer (${id})`,
      );
    }
    return;
  }
}
