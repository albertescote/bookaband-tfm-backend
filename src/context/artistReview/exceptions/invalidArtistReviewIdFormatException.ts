import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidArtistReviewIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid artist review id format: ${id}. It must be a UUID`);
  }
}
