import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidBillingAddressIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid billing address id format: ${id}. It must be a UUID`);
  }
}
