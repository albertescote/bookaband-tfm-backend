import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidInvoiceIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid invoice id format: ${id}. It must be a UUID`);
  }
}
