import { v4 as uuidv4, validate } from "uuid";
import { InvalidEventTypeIdFormatException } from "../exceptions/invalidEventTypeIdFormatException";

export default class EventTypeId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidEventTypeIdFormatException(value);
    }
  }

  static generate(): EventTypeId {
    return new EventTypeId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
