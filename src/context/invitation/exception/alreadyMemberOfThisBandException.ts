import { BadRequestException } from "../../../app/api/exceptions/badRequestException";

export class AlreadyMemberOfThisBandException extends BadRequestException {
  constructor(bandId: string) {
    super(`The requested user is already a member of this band: ${bandId}`);
  }
}
