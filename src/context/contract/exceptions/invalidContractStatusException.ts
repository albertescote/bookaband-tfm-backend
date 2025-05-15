import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class InvalidContractStatusException extends InternalServerErrorException {
  constructor(status: string) {
    super(`Invalid contract status format: ${status}.`);
  }
}
