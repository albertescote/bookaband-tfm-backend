import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BookingNotFoundForContractIdException extends InternalServerErrorException {
  constructor(id: string) {
    super(`Booking not found for this contract id: ${id}`);
  }
}
