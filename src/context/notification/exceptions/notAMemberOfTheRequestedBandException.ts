import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotAMemberOfTheRequestedBandException extends ForbiddenException {
  constructor(id: string) {
    super(`You are not a member of the requested band: ${id}`);
  }
}
