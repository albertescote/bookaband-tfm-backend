import { v4 as uuidv4, validate } from "uuid";
import { InvalidBandIdFormatException } from "../../band/exceptions/invalidBandIdFormatException";

export default class BandId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidBandIdFormatException(value);
    }
  }

  static generate(): BandId {
    return new BandId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
