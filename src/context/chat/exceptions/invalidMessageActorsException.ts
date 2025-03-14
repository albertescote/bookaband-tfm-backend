import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class InvalidMessageActorsException extends BadRequestException {
  constructor() {
    super(
      "Invalid message actors: the sender or the recipient is not registered as owner of the chat.",
    );
  }
}
