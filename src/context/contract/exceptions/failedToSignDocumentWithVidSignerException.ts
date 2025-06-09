import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class FailedToSignDocumentWithVidSignerException extends InternalServerErrorException {
  constructor(error: string) {
    super(`Failed to sign document with VIDsigner: ${error}`);
  }
}
