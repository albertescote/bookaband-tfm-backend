import { v4 as uuidv4, validate } from "uuid";
import { InvalidEmailVerificationIdFormatException } from "../exceptions/invalidEmailVerificationIdFormatException";

export default class EmailVerificationId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidEmailVerificationIdFormatException(value);
    }
  }

  static generate(): EmailVerificationId {
    return new EmailVerificationId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
