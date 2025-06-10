import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotBandMemberException extends ForbiddenException {
  constructor() {
    super(
      `You are not authorized to perform this action since you are not a member of this band`,
    );
  }
}
