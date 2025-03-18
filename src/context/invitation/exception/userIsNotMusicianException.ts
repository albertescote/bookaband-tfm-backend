import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class UserIsNotMusicianException extends BadRequestException {
  constructor() {
    super("The requested user is not a musician");
  }
}
