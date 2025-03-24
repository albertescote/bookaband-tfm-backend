import { v4 as uuidv4, validate } from "uuid";
import { InvalidRefreshIdFormatException } from "../exceptions/invalidRefreshIdFormatException";

export default class RefreshTokenId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidRefreshIdFormatException(value);
    }
  }

  static generate(): RefreshTokenId {
    return new RefreshTokenId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
