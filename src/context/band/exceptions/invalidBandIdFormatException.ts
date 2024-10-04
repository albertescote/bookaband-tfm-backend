import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvalidBandIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid band id format: ${id}. It must be a UUID`);
  }
}
