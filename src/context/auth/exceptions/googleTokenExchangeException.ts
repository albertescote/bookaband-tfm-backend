import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class GoogleTokenExchangeException extends UnauthorizedException {
  constructor() {
    super("Failed to exchange authorization code for token");
  }
}
