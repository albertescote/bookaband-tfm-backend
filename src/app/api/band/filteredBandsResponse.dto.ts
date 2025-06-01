import { BandCatalogItem } from "../../../context/band/domain/bandCatalogItem";

export interface FilteredBandsResponseDto {
  bandCatalogItems: BandCatalogItem[];
  hasMore: boolean;
  total: number;
}
