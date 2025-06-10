import { InternalServerErrorException } from "../../../app/exceptions/internalServerErrorException";

export class BandNotFoundException extends InternalServerErrorException {
  constructor(id: string) {
    super(`Band not found for this id: ${id}`);
  }
}
