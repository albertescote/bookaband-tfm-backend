import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvalidChatIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid chat id format: ${id}. It must be a UUID`);
  }
}
