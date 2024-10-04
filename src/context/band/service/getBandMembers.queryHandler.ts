import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBandMembersQuery } from "./getBandMembers.query";
import { BandRepository } from "../infrastructure/band.repository";
import BandId from "../../shared/domain/bandId";

@Injectable()
@QueryHandler(GetBandMembersQuery)
export class GetBandMembersQueryHandler
  implements IQueryHandler<GetBandMembersQuery>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(query: GetBandMembersQuery): Promise<string[]> {
    const band = await this.bandRepository.getBandById(new BandId(query.id));
    if (!band) {
      return undefined;
    }
    return band.toPrimitives().membersId;
  }
}
