import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidTimeZoneException extends BadRequestException {
  constructor(timezone: string) {
    super(`Invalid time zone : ${timezone}`);
  }
}
