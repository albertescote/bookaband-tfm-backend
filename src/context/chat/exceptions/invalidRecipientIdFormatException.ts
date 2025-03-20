import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidRecipientIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid recipient id format: ${id}. It must be a UUID`);
  }
}
