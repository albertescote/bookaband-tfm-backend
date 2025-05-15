import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UserIdNotFoundForBookingIdException extends InternalServerErrorException {
  constructor(id: string) {
    super(`User id not found for this booking id: ${id}`);
  }
}
