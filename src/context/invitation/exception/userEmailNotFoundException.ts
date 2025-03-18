import { NotFoundException } from "../../../app/api/exceptions/notFoundException";

export class UserEmailNotFoundException extends NotFoundException {
  constructor(email: string) {
    super(`User email not found: ${email}`);
  }
}
