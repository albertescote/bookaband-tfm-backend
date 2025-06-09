import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class FailedToObtainVidSignerAccessTokenException extends InternalServerErrorException {
  constructor() {
    super("Failed to obtain VIDsigner access token");
  }
}
