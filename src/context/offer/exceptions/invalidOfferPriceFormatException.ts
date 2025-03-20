import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidOfferPriceFormatException extends BadRequestException {
  constructor(price: number) {
    super(
      `Invalid offer price format: ${price}. It must be a positive value with a maximum of two decimal values`,
    );
  }
}
