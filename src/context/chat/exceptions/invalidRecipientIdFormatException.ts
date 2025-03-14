import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvalidRecipientIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid recipient id format: ${id}. It must be a UUID`);
  }
}
