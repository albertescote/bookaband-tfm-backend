import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class PasswordNotSecureException extends BadRequestException {
  constructor() {
    super(
      "The password does not meet the minimum requirements: at least 8 characters, one uppercase letter, one lowercase letter, one number, and one symbol.",
    );
  }
}
