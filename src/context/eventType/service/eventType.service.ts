import { Injectable } from "@nestjs/common";
import { EventType, EventTypePrimitives } from "../../shared/domain/eventType";
import { EventTypeRepository } from "../infrastructure/eventType.repository";
import EventTypeId from "../domain/eventTypeId";

export interface CreateEventTypeRequest {
  label: Record<string, string>;
  icon: string;
}

export interface UpdateEventTypeRequest {
  id: string;
  label: Record<string, string>;
  icon: string;
}

@Injectable()
export class EventTypeService {
  constructor(private readonly repository: EventTypeRepository) {}

  async create(
    createEventTypeRequest: CreateEventTypeRequest,
  ): Promise<EventTypePrimitives> {
    const createdEventType = await this.repository.create(
      EventType.create(
        createEventTypeRequest.label,
        createEventTypeRequest.icon,
      ),
    );
    return createdEventType.toPrimitives();
  }

  async getById(id: string): Promise<EventTypePrimitives> {
    const eventTypeFound = await this.repository.getById(new EventTypeId(id));
    return eventTypeFound.toPrimitives();
  }

  async getAll(): Promise<EventTypePrimitives[]> {
    const allEventTypesFound = await this.repository.getAll();
    return allEventTypesFound.map((eventType) => {
      return eventType.toPrimitives();
    });
  }

  async update(
    updateEventTypeRequest: UpdateEventTypeRequest,
  ): Promise<EventTypePrimitives> {
    const updatedEventType = await this.repository.update(
      EventType.fromPrimitives(updateEventTypeRequest),
    );
    return updatedEventType.toPrimitives();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(new EventTypeId(id));
  }
}
