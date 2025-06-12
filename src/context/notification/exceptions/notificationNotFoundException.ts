import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class NotificationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Notification not found for this id: ${id}`);
  }
}
