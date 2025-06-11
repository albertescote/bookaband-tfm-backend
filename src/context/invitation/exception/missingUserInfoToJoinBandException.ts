import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class MissingUserInfoToJoinBandException extends ForbiddenException {
  constructor() {
    super(
      `Phone number and national id attributes are required to join a band`,
    );
  }
}
