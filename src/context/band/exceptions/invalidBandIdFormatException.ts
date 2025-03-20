import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidBandIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid band id format: ${id}. It must be a UUID`);
  }
}
