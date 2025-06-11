import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UserNotFoundException extends InternalServerErrorException {
  constructor(id: string) {
    super(`User not found for this id: ${id}`);
  }
}
