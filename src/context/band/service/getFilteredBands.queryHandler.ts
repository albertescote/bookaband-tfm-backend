import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import { GetFilteredBandsQuery } from "./getFilteredBands.query";
import { BandCatalogItem } from "../domain/bandCatalogItem";
import TimeZone from "../domain/timeZone";

interface FilteredBandsResponse {
  bandCatalogItems: BandCatalogItem[];
  hasMore: boolean;
  total: number;
}

@Injectable()
@QueryHandler(GetFilteredBandsQuery)
export class GetFilteredBandsQueryHandler
  implements IQueryHandler<GetFilteredBandsQuery>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(query: GetFilteredBandsQuery): Promise<FilteredBandsResponse> {
    const { userId, page, pageSize, filters } = query;
    const { bandCatalogItems, total } =
      await this.bandRepository.getFilteredBandCatalogItems(page, pageSize, {
        ...filters,
        ...(filters.timeZone && { timeZone: new TimeZone(filters.timeZone) }),
      });

    const shaped = userId
      ? bandCatalogItems
      : bandCatalogItems.map(({ price, ...rest }) => rest);

    return {
      bandCatalogItems: shaped,
      hasMore: page * pageSize < total,
      total,
    };
  }
}
