import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import UserId from "../../shared/domain/userId";
import { GetUserBandsQuery } from "./getUserBands.query";
import { BandRepository } from "../infrastructure/band.repository";

@Injectable()
@QueryHandler(GetUserBandsQuery)
export class GetUserBandsQueryHandler
  implements IQueryHandler<GetUserBandsQuery>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(query: GetUserBandsQuery): Promise<string[]> {
    const userBands = await this.bandRepository.getUserBands(
      new UserId(query.id),
    );
    return userBands.map((band) => band.id);
  }
}
