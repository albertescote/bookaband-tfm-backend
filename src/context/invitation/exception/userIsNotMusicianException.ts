import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class UserIsNotMusicianException extends BadRequestException {
  constructor() {
    super("The requested user is not a musician");
  }
}
