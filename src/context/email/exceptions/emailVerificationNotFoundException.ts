import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class EmailVerificationNotFoundException extends NotFoundException {
  constructor() {
    super(`Email verification not found.`);
  }
}
