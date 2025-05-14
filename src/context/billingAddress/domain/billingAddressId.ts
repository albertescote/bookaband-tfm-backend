import { v4 as uuidv4, validate } from "uuid";
import { InvalidBillingAddressIdFormatException } from "../exceptions/invalidBillingAddressIdFormatException";

export default class BillingAddressId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidBillingAddressIdFormatException(value);
    }
  }

  static generate(): BillingAddressId {
    return new BillingAddressId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
