import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvitationAlreadySentException extends BadRequestException {
  constructor(userId: string, bandId: string) {
    super(
      `Invitation already sent for this user (${userId}) and this band (${bandId}).`,
    );
  }
}
