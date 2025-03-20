import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class InvitationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Invitation not found for this id: ${id}`);
  }
}
