import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class FailedToUpdateBandAfterLeavingException extends InternalServerErrorException {
  constructor(bandId: string) {
    super(`Failed to update band after leaving: ${bandId}`);
  }
}
