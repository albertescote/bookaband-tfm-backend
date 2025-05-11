import { InvalidEventTypeNameException } from "../../eventType/exceptions/invalidEventTypeNameException";
import EventTypeId from "../../eventType/domain/eventTypeId";

export enum EventTypeName {
  weddings = "weddings",
  privateParties = "privateParties",
  festivals = "festivals",
  restaurantsHotels = "restaurantsHotels",
  businesses = "businesses",
}

export interface EventTypePrimitives {
  id: string;
  type: string;
}

export class EventType {
  constructor(
    private readonly id: EventTypeId,
    private readonly type: EventTypeName,
  ) {}

  public static create(type: EventTypeName): EventType {
    return new EventType(EventTypeId.generate(), type);
  }

  public static fromPrimitives(primitives: EventTypePrimitives): EventType {
    const eventTypeName: EventTypeName = EventTypeName[primitives.type];
    if (!eventTypeName) {
      throw new InvalidEventTypeNameException(primitives.type);
    }
    return new EventType(new EventTypeId(primitives.id), eventTypeName);
  }

  public toPrimitives(): EventTypePrimitives {
    return {
      id: this.id.toPrimitive(),
      type: this.type,
    };
  }

  public getId(): EventTypeId {
    return this.id;
  }

  public getType(): EventTypeName {
    return this.type;
  }
}
