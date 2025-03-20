import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidPasswordException extends UnauthorizedException {
  constructor() {
    super(`Invalid password`);
  }
}
