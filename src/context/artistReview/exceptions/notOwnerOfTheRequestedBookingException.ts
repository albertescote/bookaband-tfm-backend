import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedBookingException extends ForbiddenException {
  constructor(bookingId: string) {
    super(`You are not the owner of the requested booking: ${bookingId}`);
  }
}
