import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class GoogleMapsApiException extends BadRequestException {
  constructor() {
    super("Location or distance calculation error. Unable to geocode location or calculate route.");
  }
}
