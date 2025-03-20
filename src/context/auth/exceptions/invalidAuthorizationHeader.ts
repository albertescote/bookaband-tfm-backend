import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidAuthorizationHeader extends UnauthorizedException {
  constructor() {
    super(`Missing or invalid authorization header`);
  }
}
