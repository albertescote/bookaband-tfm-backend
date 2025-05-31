import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BandNotCreatedException extends InternalServerErrorException {
  constructor() {
    super("Band could not be created");
  }
}
