import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedInvoiceException extends ForbiddenException {
  constructor(id: string) {
    super(`You are not owner of the requested invoice: ${id}`);
  }
}
