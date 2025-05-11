import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class NoEventTypesRegisteredException extends InternalServerErrorException {
  constructor() {
    super("No event types registered");
  }
}
