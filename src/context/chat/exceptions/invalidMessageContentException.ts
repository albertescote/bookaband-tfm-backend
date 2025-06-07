import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class InvalidMessageContentException extends InternalServerErrorException {
  constructor() {
    super(
      "Invalid message content: neither message nor file url nor booking reference are present",
    );
  }
}
