import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BandNotFoundException extends InternalServerErrorException {
  constructor(id: string) {
    super(`Offer not found for this booking: ${id}`);
  }
}
