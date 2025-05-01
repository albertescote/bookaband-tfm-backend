import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidResetPasswordTokenException extends UnauthorizedException {
  constructor() {
    super("Invalid reset password token");
  }
}
