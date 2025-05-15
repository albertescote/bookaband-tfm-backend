import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class InvalidInvoiceStatusException extends InternalServerErrorException {
  constructor(status: string) {
    super(`Invalid invoice status format: ${status}.`);
  }
}
