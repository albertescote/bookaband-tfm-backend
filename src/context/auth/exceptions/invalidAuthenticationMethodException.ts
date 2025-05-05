import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class InvalidAuthenticationMethodException extends ForbiddenException {
  constructor() {
    super(`Invalid authentication method used for this account`);
  }
}
