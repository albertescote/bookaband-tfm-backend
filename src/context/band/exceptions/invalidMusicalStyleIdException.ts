import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidMusicalStyleIdException extends BadRequestException {
  constructor(invalidIds: string[]) {
    super(`Invalid musical style IDs: ${invalidIds.join(", ")}`);
  }
} 