import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class FailedToFetchGasPriceException extends BadRequestException {
  constructor() {
    super("Failed to fetch gas price");
  }
}
