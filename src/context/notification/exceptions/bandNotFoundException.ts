import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class BandNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Band not found for this id: ${id}`);
  }
}
