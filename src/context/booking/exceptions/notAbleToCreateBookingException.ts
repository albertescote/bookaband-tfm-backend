import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class NotAbleToCreateBookingException extends InternalServerErrorException {
  constructor() {
    super("Not able to create booking");
  }
}
