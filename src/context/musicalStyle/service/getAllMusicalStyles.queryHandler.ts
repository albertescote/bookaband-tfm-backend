import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllMusicalStylesQuery } from "./getAllMusicalStyles.query";
import { MusicalStyleRepository } from "../infrastructure/musicalStyle.repository";
import { MusicalStylePrimitives } from "../../shared/domain/musicalStyle";

@Injectable()
@QueryHandler(GetAllMusicalStylesQuery)
export class GetAllMusicalStylesQueryHandler
  implements IQueryHandler<GetAllMusicalStylesQuery>
{
  constructor(private musicalStyleRepository: MusicalStyleRepository) {}

  async execute(query: GetAllMusicalStylesQuery): Promise<MusicalStylePrimitives[]> {
    const musicalStyles = await this.musicalStyleRepository.getAll();
    if (!musicalStyles) {
      return undefined;
    }
    return musicalStyles.map((musicalStyle) => musicalStyle.toPrimitives());
  }
} 