import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class EmailVerificationRateLimitExceededException extends ForbiddenException {
  constructor() {
    super(
      "You must wait at least 30 seconds before resending the verification email.",
    );
  }
}
