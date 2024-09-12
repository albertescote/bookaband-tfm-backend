import { v4 as uuidv4, validate } from 'uuid';
import { InvalidOfferIdFormatException } from '../exceptions/invalidOfferIdFormatException';

export default class OfferId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidOfferIdFormatException(value);
    }
  }

  static generate(): OfferId {
    return new OfferId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
