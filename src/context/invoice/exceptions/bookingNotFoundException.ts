import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BookingNotFoundException extends InternalServerErrorException {
  constructor(id: string) {
    super(`Booking not found for this id: ${id}`);
  }
}
