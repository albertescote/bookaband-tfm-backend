import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class NotOwnerOfTheRequestedBandException extends ForbiddenException {
  constructor(id: string) {
    super(`You are not owner of the requested band: ${id}`);
  }
}
