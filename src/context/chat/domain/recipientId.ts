import { v4 as uuidv4, validate } from "uuid";
import { InvalidRecipientIdFormatException } from "../exceptions/invalidRecipientIdFormatException";

export default class RecipientId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidRecipientIdFormatException(value);
    }
  }

  static generate(): RecipientId {
    return new RecipientId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
