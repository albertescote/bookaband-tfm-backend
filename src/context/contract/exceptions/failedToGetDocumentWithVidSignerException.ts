import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class FailedToGetDocumentWithVidSignerException extends InternalServerErrorException {
  constructor(error: string) {
    super(`Failed to get document with VIDsigner: ${error}`);
  }
}
