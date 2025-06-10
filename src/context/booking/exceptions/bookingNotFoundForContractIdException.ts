import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class BookingNotFoundForContractIdException extends NotFoundException {
  constructor(id: string) {
    super(`Booking not found for this contract id: ${id}`);
  }
}
