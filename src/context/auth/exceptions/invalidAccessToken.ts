import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidAccessToken extends UnauthorizedException {
  constructor() {
    super(`Invalid access token`);
  }
}
