import { OfferOverview } from "../../../context/offer/domain/offerOverview";

export interface OfferOverviewResponseDto {
  offers: OfferOverview[];
  hasMore: boolean;
  total: number;
}
