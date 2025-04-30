import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class NotAbleToVerifyUserEmailException extends InternalServerErrorException {
  constructor() {
    super("Failed to update user email verification status");
  }
}
