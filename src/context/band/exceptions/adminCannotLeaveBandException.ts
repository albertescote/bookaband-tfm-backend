import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class AdminCannotLeaveBandException extends BadRequestException {
  constructor(userId: string, bandId: string) {
    super(
      `Admin ${userId} cannot leave band ${bandId} as they are the only admin`,
    );
  }
}
