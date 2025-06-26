import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToStoreArtistReviewException extends InternalServerErrorException {
  constructor() {
    super(`Unable to store artist review in database`);
  }
}
