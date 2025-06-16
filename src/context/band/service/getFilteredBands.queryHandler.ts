import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import { GetFilteredBandsQuery } from "./getFilteredBands.query";
import { BandCatalogItem } from "../domain/bandCatalogItem";
import TimeZone from "../domain/timeZone";
import { format, toZonedTime } from "date-fns-tz";

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

    const dateFilters = filters.date
      ? this.prepareDateFilters(filters.date, new TimeZone(filters.timeZone))
      : undefined;

    const { bandCatalogItems, total } =
      await this.bandRepository.getFilteredBandCatalogItems(page, pageSize, {
        artistName: filters.artistName,
        date: dateFilters,
        location: filters.location,
      });

    const shapedItems = userId
      ? bandCatalogItems
      : bandCatalogItems.map(({ price, ...rest }) => rest);

    const hasMore = page * pageSize < total;

    return {
      bandCatalogItems: shapedItems,
      total,
      hasMore,
    };
  }

  private prepareDateFilters(
    date: string,
    timeZone: TimeZone,
  ): { utcStart: Date; utcEnd: Date; dayOfWeek: string } {
    const utcStart = toZonedTime(
      `${date}T00:00:00`,
      timeZone ? timeZone.getValue() : "Europe/Madrid",
    );
    const utcEnd = toZonedTime(
      `${date}T23:59:59`,
      timeZone ? timeZone.getValue() : "Europe/Madrid",
    );
    const localDate = toZonedTime(date, timeZone.getValue());
    const dayOfWeek = format(localDate, "EEEE").toLowerCase();

    return { utcStart, utcEnd, dayOfWeek };
  }
}
