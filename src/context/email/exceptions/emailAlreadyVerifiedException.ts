import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class EmailAlreadyVerifiedException extends BadRequestException {
  constructor() {
    super("Email already verified.");
  }
}
