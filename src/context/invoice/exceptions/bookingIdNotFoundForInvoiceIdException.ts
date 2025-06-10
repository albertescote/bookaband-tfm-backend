import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BookingIdNotFoundForInvoiceIdException extends InternalServerErrorException {
  constructor(id: string) {
    super(`Booking not found for this invoice id: ${id}`);
  }
}
