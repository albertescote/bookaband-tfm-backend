import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class GoogleTokenPayloadException extends UnauthorizedException {
  constructor() {
    super("Failed to decode id_token");
  }
}
