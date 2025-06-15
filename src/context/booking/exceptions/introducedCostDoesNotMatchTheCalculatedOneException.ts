import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class IntroducedCostDoesNotMatchTheCalculatedOneException extends BadRequestException {
  constructor() {
    super(`Introduced cost does not match the calculated one`);
  }
}
