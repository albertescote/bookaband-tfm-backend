import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidPaymentMethodIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid payment method id format: ${id}. It must be a UUID`);
  }
}
