import moment from "moment-timezone";
import { InvalidTimeZoneException } from "../exceptions/invalidTimeZoneException";

export default class TimeZone {
  constructor(private value: string) {
    this.validate(value);
  }

  validate(value: string) {
    const timeZones = moment.tz.names();
    if (!timeZones.includes(value)) {
      throw new InvalidTimeZoneException(value);
    }
  }

  getValue(): string {
    return this.value;
  }
}
