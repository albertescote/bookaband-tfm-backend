import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidSessionIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid session id format: ${id}. It must be a UUID`);
  }
}
