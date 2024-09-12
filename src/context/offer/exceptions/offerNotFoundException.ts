import { NotFoundException } from '../../../app/api/exceptions/notFoundException';

export class OfferNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Offer not found for this id: ${id}`);
  }
}
