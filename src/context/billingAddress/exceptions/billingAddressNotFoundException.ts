import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class BillingAddressNotFoundException extends NotFoundException {
  constructor() {
    super(`Billing address not found`);
  }
}
