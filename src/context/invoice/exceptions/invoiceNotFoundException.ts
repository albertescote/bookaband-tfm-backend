import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class InvoiceNotFoundException extends NotFoundException {
  constructor() {
    super("Invoice not found");
  }
}
