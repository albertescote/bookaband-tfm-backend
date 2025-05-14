import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class UnableToCreatePaymentMethodException extends NotFoundException {
  constructor() {
    super(`Unable to create billing address`);
  }
}
