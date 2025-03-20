import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedInvitationException extends ForbiddenException {
  constructor(invitationId: string) {
    super(`You are not owner of the requested invitation: ${invitationId}`);
  }
}
