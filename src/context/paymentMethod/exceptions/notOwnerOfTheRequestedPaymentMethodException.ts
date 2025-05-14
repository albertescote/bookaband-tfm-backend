import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedPaymentMethodException extends ForbiddenException {
  constructor(id: string) {
    super(`You are not owner of the requested billing address: ${id}`);
  }
}
