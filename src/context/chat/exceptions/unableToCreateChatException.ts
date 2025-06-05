import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class UnableToCreateChatException extends InternalServerErrorException {
  constructor() {
    super("Unable to create chat");
  }
}
