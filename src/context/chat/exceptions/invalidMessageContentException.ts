import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class InvalidMessageContentException extends InternalServerErrorException {
  constructor() {
    super(
      "Invalid message content: neither message nor booking reference are present",
    );
  }
}
