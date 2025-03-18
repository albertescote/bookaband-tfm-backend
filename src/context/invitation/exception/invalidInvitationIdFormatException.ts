import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvalidInvitationIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid invitation id format: ${id}. It must be a UUID`);
  }
}
