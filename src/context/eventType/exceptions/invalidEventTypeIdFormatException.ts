import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidEventTypeIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid event type id format: ${id}. It must be a UUID`);
  }
}
