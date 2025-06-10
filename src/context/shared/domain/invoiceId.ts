import { v4 as uuidv4, validate } from "uuid";
import { InvalidInvoiceIdFormatException } from "../../invoice/exceptions/invalidInvoiceIdFormatException";

export default class InvoiceId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidInvoiceIdFormatException(value);
    }
  }

  static generate(): InvoiceId {
    return new InvoiceId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
