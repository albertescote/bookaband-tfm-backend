import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToUpdateBookingException extends InternalServerErrorException {
  constructor() {
    super("Not able to update booking");
  }
}
