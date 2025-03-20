import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedChatException extends ForbiddenException {
  constructor() {
    super(`You are not the owner of the requested chat.`);
  }
}
