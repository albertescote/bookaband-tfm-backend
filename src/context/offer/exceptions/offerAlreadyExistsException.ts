import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class OfferAlreadyExistsException extends BadRequestException {
  constructor(id: string) {
    super(`An offer already exists for this band id: ${id}`);
  }
}
