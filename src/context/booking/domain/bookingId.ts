import { v4 as uuidv4, validate } from "uuid";
import { InvalidBookingIdFormatException } from "../exceptions/invalidBookingIdFormatException";

export default class BookingId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidBookingIdFormatException(value);
    }
  }

  static generate(): BookingId {
    return new BookingId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
