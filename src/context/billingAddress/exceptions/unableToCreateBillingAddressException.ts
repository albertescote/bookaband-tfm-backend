import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class UnableToCreateBillingAddressException extends NotFoundException {
  constructor() {
    super(`Unable to create billing address`);
  }
}
