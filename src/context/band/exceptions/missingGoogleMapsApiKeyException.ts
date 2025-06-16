import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class MissingGoogleMapsApiKeyException extends InternalServerErrorException {
  constructor() {
    super("Missing Google Maps API key.");
  }
}
