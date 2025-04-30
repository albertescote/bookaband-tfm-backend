import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class InvalidLanguageException extends InternalServerErrorException {
  constructor(lng: string) {
    super(`Invalid language: ${lng}`);
  }
}
