import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToCreatePaymentMethodException extends InternalServerErrorException {
  constructor() {
    super(`Unable to create billing address`);
  }
}
