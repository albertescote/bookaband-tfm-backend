import { UnauthorizedException } from "../../../app/api/exceptions/unauthorizedException";

export class InvalidAccessTokenSubject extends UnauthorizedException {
  constructor(subject: string) {
    super(`Invalid access token subject: ${subject}`);
  }
}
