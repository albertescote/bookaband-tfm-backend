import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class RefreshTokenNotFoundException extends NotFoundException {
  constructor() {
    super("Refresh token not found");
  }
}
