import { PrismaClient } from "@prisma/client";
import { EventType } from "../../shared/domain/eventType";
import EventTypeId from "../domain/eventTypeId";

export class EventTypeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(type: EventType): Promise<EventType> {
    const createdEventType = await this.prisma.eventType.create({
      data: type.toPrimitives(),
    });
    return EventType.fromPrimitives(createdEventType);
  }

  async getById(id: EventTypeId): Promise<EventType> {
    const result = await this.prisma.eventType.findFirst({
      where: { id: id.toPrimitive() },
    });
    return EventType.fromPrimitives(result);
  }

  async getAll(): Promise<EventType[]> {
    const result = await this.prisma.eventType.findMany();
    return result.map((eventType) => {
      return EventType.fromPrimitives(eventType);
    });
  }

  async update(type: EventType): Promise<EventType> {
    const updatedEventType = await this.prisma.eventType.update({
      where: { id: type.getId().toPrimitive() },
      data: type.toPrimitives,
    });
    return EventType.fromPrimitives(updatedEventType);
  }

  async delete(id: EventTypeId): Promise<void> {
    await this.prisma.eventType.delete({ where: { id: id.toPrimitive() } });
  }
}
