import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class ResetPasswordSessionNotFoundException extends InternalServerErrorException {
  constructor() {
    super(`Reset password session not found.`);
  }
}
