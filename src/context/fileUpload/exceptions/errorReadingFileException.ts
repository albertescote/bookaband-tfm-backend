import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class ErrorReadingFileException extends InternalServerErrorException {
  constructor() {
    super(`Error reading file`);
  }
}
