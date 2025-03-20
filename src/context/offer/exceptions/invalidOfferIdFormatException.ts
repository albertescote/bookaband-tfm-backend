import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidOfferIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid offer id format: ${id}. It must be a UUID`);
  }
}
