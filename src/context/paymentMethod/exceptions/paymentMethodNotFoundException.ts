import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class PaymentMethodNotFoundException extends NotFoundException {
  constructor() {
    super(`Billing address not found`);
  }
}
