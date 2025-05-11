import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class EventTypeIdNotFoundException extends BadRequestException {
  constructor() {
    super("Event type id not found");
  }
}
