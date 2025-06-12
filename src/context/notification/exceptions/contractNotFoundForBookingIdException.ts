import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class ContractNotFoundForBookingIdException extends NotFoundException {
  constructor(id: string) {
    super(`Contract not found for this booking id: ${id}`);
  }
}
