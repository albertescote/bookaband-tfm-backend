import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class NotAbleToExecuteRefreshTokenDbTransactionException extends InternalServerErrorException {
  constructor(action: string) {
    super(`We have not been able to execute your transaction: ${action}`);
  }
}
