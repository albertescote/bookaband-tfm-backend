import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class AlreadyMemberOfThisBandException extends BadRequestException {
  constructor(bandId: string) {
    super(`The requested user is already a member of this band: ${bandId}`);
  }
}
