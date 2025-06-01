import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import { GetFeaturedBandsQuery } from "./getFeaturedBands.query";
import { BandRole } from "../domain/bandRole";

export interface FeaturedBand {
  id: string;
  name: string;
  members: { id: string; role: BandRole }[];
  musicalStyleIds: string[];
  price?: number;
  imageUrl?: string;
  bio?: string;
}

interface FilteredBandsResponse {
  featuredBands: FeaturedBand[];
  hasMore: boolean;
  total: number;
}

@Injectable()
@QueryHandler(GetFeaturedBandsQuery)
export class GetFeaturedBandsQueryHandler
  implements IQueryHandler<GetFeaturedBandsQuery>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(query: GetFeaturedBandsQuery): Promise<FilteredBandsResponse> {
    const { userId, page, pageSize } = query;
    const { featuredBands, total } = await this.bandRepository.getFeaturedBands(
      page,
      pageSize,
    );

    const shaped = userId
      ? featuredBands
      : featuredBands.map(({ price, ...rest }) => rest);

    return {
      featuredBands: shaped,
      hasMore: page * pageSize < total,
      total,
    };
  }
}
