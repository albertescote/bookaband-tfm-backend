import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidTokenException extends BadRequestException {
  constructor() {
    super("Invalid verification token");
  }
}
