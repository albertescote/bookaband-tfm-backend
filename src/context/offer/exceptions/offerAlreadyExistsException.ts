import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class OfferAlreadyExistsException extends BadRequestException {
  constructor(id: string) {
    super(`An offer already exists for this band id: ${id}`);
  }
}
