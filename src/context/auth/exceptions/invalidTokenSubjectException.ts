import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class InvalidTokenSubjectException extends UnauthorizedException {
  constructor(subject: string) {
    super(`Invalid token subject: ${subject}`);
  }
}
