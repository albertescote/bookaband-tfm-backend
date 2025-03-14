import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvalidSenderIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid sender id format: ${id}. It must be a UUID`);
  }
}
