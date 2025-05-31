import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class UserIsNotMemberOfBandException extends ForbiddenException {
  constructor(userId: string, bandId: string) {
    super(`User ${userId} is not a member of band ${bandId}`);
  }
}
