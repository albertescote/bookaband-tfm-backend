import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class UserIdNotFoundForBookingIdException extends BadRequestException {
  constructor(id: string) {
    super(`User id not found for this booking id: ${id}`);
  }
}
