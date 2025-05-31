import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BandNotUpdatedException extends InternalServerErrorException {
  constructor() {
    super("Band could not be updated");
  }
}
