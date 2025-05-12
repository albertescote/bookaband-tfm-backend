import { EventType } from "../../shared/domain/eventType";
import EventTypeId from "../domain/eventTypeId";
import MongoCollectionService from "../../shared/infrastructure/db/mongoCollection.service";
import { MONGODB_COLLECTIONS } from "../../../config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EventTypeRepository {
  constructor(
    private readonly mongoCollectionService: MongoCollectionService,
  ) {}

  async create(type: EventType): Promise<EventType> {
    const primitives = type.toPrimitives();

    await this.mongoCollectionService.insertOne(
      MONGODB_COLLECTIONS.EVENT_TYPES,
      {
        id: primitives.id,
        label: primitives.label,
        icon: primitives.icon,
      },
    );

    return type;
  }

  async getById(id: EventTypeId): Promise<EventType | undefined> {
    const query = { id: id.toPrimitive() };

    const result = await this.mongoCollectionService.findOne(
      MONGODB_COLLECTIONS.EVENT_TYPES,
      query,
    );

    if (!result) return undefined;

    return EventType.fromPrimitives({
      id: result.id,
      label: result.label,
      icon: result.icon,
    });
  }

  async getAll(): Promise<EventType[]> {
    const result = await this.mongoCollectionService.findMany(
      MONGODB_COLLECTIONS.EVENT_TYPES,
      {},
    );

    return result.map((doc) =>
      EventType.fromPrimitives({
        id: doc.id,
        label: doc.label,
        icon: doc.icon,
      }),
    );
  }

  async update(type: EventType): Promise<EventType> {
    const primitives = type.toPrimitives();

    await this.mongoCollectionService.updateOne(
      MONGODB_COLLECTIONS.EVENT_TYPES,
      { id: primitives.id },
      {
        $set: {
          label: primitives.label,
          icon: primitives.icon,
        },
      },
    );

    return type;
  }

  async delete(id: EventTypeId): Promise<void> {
    await this.mongoCollectionService.deleteOne(
      MONGODB_COLLECTIONS.EVENT_TYPES,
      { id: id.toPrimitive() },
    );
  }
}
