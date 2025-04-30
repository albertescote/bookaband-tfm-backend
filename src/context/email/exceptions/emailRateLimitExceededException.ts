import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class EmailRateLimitExceededException extends BadRequestException {
  constructor() {
    super(
      "Please wait 30 seconds before requesting another verification email",
    );
  }
}
