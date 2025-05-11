import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class InvalidEventTypeNameException extends InternalServerErrorException {
  constructor(eventType: string) {
    super(`Invalid event type name: ${eventType}`);
  }
}
