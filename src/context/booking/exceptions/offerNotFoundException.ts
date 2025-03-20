import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class OfferNotFoundException extends InternalServerErrorException {
  constructor(id: string) {
    super(`Offer not found for this booking: ${id}`);
  }
}
