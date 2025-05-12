import { OfferDetails } from "../../../context/offer/domain/offerDetails";

export interface OfferFilteredDetailsResponseDto {
  offers: OfferDetails[];
  hasMore: boolean;
  total: number;
}
