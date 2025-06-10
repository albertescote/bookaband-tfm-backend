import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BandNotFoundForInvoiceException extends InternalServerErrorException {
  constructor(invoiceId: string) {
    super(`Band not found for invoice: ${invoiceId}`);
  }
} 