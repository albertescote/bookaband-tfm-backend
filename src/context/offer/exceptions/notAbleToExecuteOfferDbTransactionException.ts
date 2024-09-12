import { InternalServerErrorException } from '../../../app/api/exceptions/internalServerErrorException';

export class NotAbleToExecuteOfferDbTransactionException extends InternalServerErrorException {
  constructor(action: string) {
    super(`We have not been able to execute your transaction: ${action}`);
  }
}
