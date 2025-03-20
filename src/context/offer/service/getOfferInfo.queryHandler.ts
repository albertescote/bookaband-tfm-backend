import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { OfferRepository } from "../infrastructure/offer.repository";
import OfferId from "../../shared/domain/offerId";
import { GetOfferInfoQuery } from "./getOfferInfo.query";
import { OfferPrimitives } from "../domain/offer";

@Injectable()
@QueryHandler(GetOfferInfoQuery)
export class GetOfferInfoQueryHandler
  implements IQueryHandler<GetOfferInfoQuery>
{
  constructor(private offerRepository: OfferRepository) {}

  async execute(query: GetOfferInfoQuery): Promise<OfferPrimitives> {
    const offer = await this.offerRepository.getOfferById(
      new OfferId(query.id),
    );
    if (!offer) {
      return undefined;
    }
    return offer.toPrimitives();
  }
}
