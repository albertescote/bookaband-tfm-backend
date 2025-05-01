import { v4 as uuidv4, validate } from "uuid";
import { InvalidSessionIdFormatException } from "../exceptions/invalidSessionIdFormatException";

export default class SessionId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidSessionIdFormatException(value);
    }
  }

  static generate(): SessionId {
    return new SessionId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
