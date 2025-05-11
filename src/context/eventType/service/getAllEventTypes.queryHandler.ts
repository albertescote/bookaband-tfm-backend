import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllEventTypesQuery } from "./getAllEventTypes.query";
import { EventTypeRepository } from "../infrastructure/eventType.repository";
import { EventTypePrimitives } from "../../shared/domain/eventType";

@Injectable()
@QueryHandler(GetAllEventTypesQuery)
export class GetAllEventTypesQueryHandler
  implements IQueryHandler<GetAllEventTypesQuery>
{
  constructor(private eventTypeRepository: EventTypeRepository) {}

  async execute(query: GetAllEventTypesQuery): Promise<EventTypePrimitives[]> {
    const eventTypes = await this.eventTypeRepository.getAll();
    if (!eventTypes) {
      return undefined;
    }
    return eventTypes.map((eventType) => eventType.toPrimitives());
  }
}
