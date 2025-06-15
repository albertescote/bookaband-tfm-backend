import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class GoogleMapsApiException extends BadRequestException {
  constructor() {
    super("Google Maps API error");
  }
}
