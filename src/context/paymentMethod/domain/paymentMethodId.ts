import { v4 as uuidv4, validate } from "uuid";
import { InvalidPaymentMethodIdFormatException } from "../exceptions/invalidPaymentMethodIdFormatException";

export default class PaymentMethodId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidPaymentMethodIdFormatException(value);
    }
  }

  static generate(): PaymentMethodId {
    return new PaymentMethodId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
