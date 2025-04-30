import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class NotAbleToExecuteEmailVerificationDbTransactionException extends InternalServerErrorException {
  constructor(action: string) {
    super(`We have not been able to execute your transaction: ${action}`);
  }
}
