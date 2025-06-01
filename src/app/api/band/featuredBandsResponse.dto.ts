import { FeaturedBand } from "../../../context/band/service/getFeaturedBands.queryHandler";

export interface FeaturedBandsResponseDto {
  featuredBands: FeaturedBand[];
  hasMore: boolean;
  total: number;
}
