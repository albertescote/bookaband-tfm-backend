import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidEventTypeIconException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid event type icon: ${message}`);
  }
}
