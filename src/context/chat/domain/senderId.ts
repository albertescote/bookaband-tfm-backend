import { v4 as uuidv4, validate } from "uuid";
import { InvalidSenderIdFormatException } from "../exceptions/invalidSenderIdFormatException";

export default class SenderId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidSenderIdFormatException(value);
    }
  }

  static generate(): SenderId {
    return new SenderId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
