import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidBookingIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid booking id format: ${id}. It must be a UUID`);
  }
}
