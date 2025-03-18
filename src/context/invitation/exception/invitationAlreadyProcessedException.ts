import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvitationAlreadyProcessedException extends BadRequestException {
  constructor() {
    super(`Invitation already processed`);
  }
}
