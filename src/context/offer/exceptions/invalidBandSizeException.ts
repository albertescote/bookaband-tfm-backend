import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class InvalidBandSizeException extends InternalServerErrorException {
  constructor(bandSize: string) {
    super(`Invalid band size: ${bandSize}`);
  }
}
