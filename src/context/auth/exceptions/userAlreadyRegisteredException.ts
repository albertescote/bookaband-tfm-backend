import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class UserAlreadyRegisteredException extends UnauthorizedException {
  constructor(email: string) {
    super(`User already registered for this email: ${email}`);
  }
}
