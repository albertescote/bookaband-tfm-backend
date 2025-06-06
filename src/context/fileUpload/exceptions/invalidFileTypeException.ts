import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidFileTypeException extends BadRequestException {
  constructor(mimeType: string, allowedTypes: string[]) {
    super(`Invalid file type: ${mimeType}. Allowed types are: ${allowedTypes.join(', ')}`);
  }
} 