import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class BookingNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Booking not found for this id: ${id}`);
  }
}
