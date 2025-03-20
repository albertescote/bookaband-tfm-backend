import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidBandIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid message id format: ${id}. It must be a UUID`);
  }
}
