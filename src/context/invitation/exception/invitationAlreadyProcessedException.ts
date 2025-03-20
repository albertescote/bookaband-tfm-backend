import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvitationAlreadyProcessedException extends BadRequestException {
  constructor() {
    super(`Invitation already processed`);
  }
}
