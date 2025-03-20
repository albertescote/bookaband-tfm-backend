import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidEmailException extends UnauthorizedException {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
  }
}
