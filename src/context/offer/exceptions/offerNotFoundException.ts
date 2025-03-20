import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class OfferNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Offer not found for this id: ${id}`);
  }
}
