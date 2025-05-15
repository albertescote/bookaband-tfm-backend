import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToCreateInvoiceException extends InternalServerErrorException {
  constructor() {
    super(`Unable to create invoice`);
  }
}
