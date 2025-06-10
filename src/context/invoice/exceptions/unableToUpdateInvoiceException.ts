import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToUpdateInvoiceException extends InternalServerErrorException {
  constructor() {
    super(`Unable to update invoice`);
  }
}
