import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidUserIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid user id format: ${id}. It must be a UUID`);
  }
}
