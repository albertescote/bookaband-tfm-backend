import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidEventTypeIdException extends BadRequestException {
  constructor(invalidIds: string[]) {
    super(`Invalid event type IDs: ${invalidIds.join(", ")}`);
  }
}
