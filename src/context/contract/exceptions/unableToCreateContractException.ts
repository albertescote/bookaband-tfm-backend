import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToCreateContractException extends InternalServerErrorException {
  constructor() {
    super(`Unable to create contract`);
  }
}
