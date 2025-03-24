import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidRefreshIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid refresh token id format: ${id}. It must be a UUID`);
  }
}
