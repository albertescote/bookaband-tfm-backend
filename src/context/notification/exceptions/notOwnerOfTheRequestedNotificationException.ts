import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedNotificationException extends ForbiddenException {
  constructor(id: string) {
    super(`You are not owner of the requested notification: ${id}`);
  }
}
