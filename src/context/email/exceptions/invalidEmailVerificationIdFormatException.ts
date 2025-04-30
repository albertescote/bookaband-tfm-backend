import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidEmailVerificationIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid email verification id format: ${id}. It must be a UUID`);
  }
}
