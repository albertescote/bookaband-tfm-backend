import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class InvoiceNotFoundForBookingIdException extends NotFoundException {
  constructor(id: string) {
    super(`Invoice not found for this booking id: ${id}`);
  }
}
