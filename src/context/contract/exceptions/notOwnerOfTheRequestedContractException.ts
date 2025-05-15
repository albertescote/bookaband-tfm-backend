import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedContractException extends ForbiddenException {
  constructor(id: string) {
    super(`You are not owner of the requested contract: ${id}`);
  }
}
