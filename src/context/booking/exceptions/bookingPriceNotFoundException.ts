import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class BookingPriceNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Booking price not found for this id: ${id}`);
  }
}
