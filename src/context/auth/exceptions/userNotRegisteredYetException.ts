import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class UserNotRegisteredYetException extends UnauthorizedException {
  constructor(email: string) {
    super(`User not registered yet for this email: ${email}`);
  }
}
