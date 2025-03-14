import { v4 as uuidv4, validate } from "uuid";
import { InvalidBandIdFormatException } from "../../band/exceptions/invalidBandIdFormatException";

export default class MessageId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidBandIdFormatException(value);
    }
  }

  static generate(): MessageId {
    return new MessageId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
