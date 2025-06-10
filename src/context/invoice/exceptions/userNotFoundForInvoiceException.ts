import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UserNotFoundForInvoiceException extends InternalServerErrorException {
  constructor(id: string) {
    super(`User not found for this invoice: ${id}`);
  }
} 