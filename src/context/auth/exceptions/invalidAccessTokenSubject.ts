import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidAccessTokenSubject extends UnauthorizedException {
  constructor(subject: string) {
    super(`Invalid access token subject: ${subject}`);
  }
}
