import { v4 as uuidv4, validate } from "uuid";
import { InvalidArtistReviewIdFormatException } from "../exceptions/invalidArtistReviewIdFormatException";

export class ArtistReviewId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidArtistReviewIdFormatException(value);
    }
  }

  static generate(): ArtistReviewId {
    return new ArtistReviewId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
