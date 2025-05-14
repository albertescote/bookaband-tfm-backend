import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedBillingAddressException extends ForbiddenException {
  constructor(id: string) {
    super(`You are not owner of the requested billing address: ${id}`);
  }
}
