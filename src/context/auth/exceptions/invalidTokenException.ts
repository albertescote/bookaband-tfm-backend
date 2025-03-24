import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super(`Invalid token`);
  }
}
