import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import BandId from "../../shared/domain/bandId";
import { GetBandInfoQuery } from "./getBandInfo.query";
import { BandPrimitives } from "../domain/band";

@Injectable()
@QueryHandler(GetBandInfoQuery)
export class GetBandInfoQueryHandler
  implements IQueryHandler<GetBandInfoQuery>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(query: GetBandInfoQuery): Promise<BandPrimitives> {
    const band = await this.bandRepository.getBandById(new BandId(query.id));
    if (!band) {
      return undefined;
    }
    return band.toPrimitives();
  }
}
