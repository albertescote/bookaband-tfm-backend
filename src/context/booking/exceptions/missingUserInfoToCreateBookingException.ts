import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class MissingUserInfoToCreateBookingException extends ForbiddenException {
  constructor() {
    super(
      `Phone number and national id attributes are required to create a booking`,
    );
  }
}
