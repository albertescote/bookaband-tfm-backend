import EventTypeId from "../../eventType/domain/eventTypeId";
import { EventTypeIcon } from "../../eventType/domain/eventTypeIcon";
import { EventTypeLabel } from "../../eventType/domain/eventTypeLabel";

export interface EventTypePrimitives {
  id: string;
  label: Record<string, string>;
  icon: string;
}

export class EventType {
  constructor(
    private readonly id: EventTypeId,
    private readonly label: EventTypeLabel,
    private readonly icon: EventTypeIcon,
  ) {}

  public static fromPrimitives(primitives: EventTypePrimitives): EventType {
    return new EventType(
      new EventTypeId(primitives.id),
      new EventTypeLabel(primitives.label),
      new EventTypeIcon(primitives.icon),
    );
  }

  static create(label: Record<string, string>, icon: string): EventType {
    return new EventType(
      EventTypeId.generate(),
      new EventTypeLabel(label),
      new EventTypeIcon(icon),
    );
  }

  public toPrimitives(): EventTypePrimitives {
    return {
      id: this.id.toPrimitive(),
      label: this.label.toPrimitives(),
      icon: this.icon.toPrimitives(),
    };
  }

  public getId(): EventTypeId {
    return this.id;
  }

  public getLabel(): EventTypeLabel {
    return this.label;
  }

  public getIcon(): EventTypeIcon {
    return this.icon;
  }
}
