import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class BookingAlreadyProcessedException extends BadRequestException {
  constructor() {
    super(`Booking already processed`);
  }
}
