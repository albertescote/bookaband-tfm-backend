import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidEventTypeLabelException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid event type label: ${message}`);
  }
}
