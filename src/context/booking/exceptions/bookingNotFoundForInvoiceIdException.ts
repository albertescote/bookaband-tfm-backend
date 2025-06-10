import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class BookingNotFoundForInvoiceIdException extends NotFoundException {
  constructor(id: string) {
    super(`Booking not found for this invoice id: ${id}`);
  }
}
