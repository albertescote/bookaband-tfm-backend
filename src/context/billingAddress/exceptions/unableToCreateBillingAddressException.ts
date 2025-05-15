import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToCreateBillingAddressException extends InternalServerErrorException {
  constructor() {
    super(`Unable to create billing address`);
  }
}
