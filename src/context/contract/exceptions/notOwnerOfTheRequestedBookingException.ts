import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedBookingException extends ForbiddenException {
  constructor() {
    super("You are not the owner of the requested booking");
  }
}
