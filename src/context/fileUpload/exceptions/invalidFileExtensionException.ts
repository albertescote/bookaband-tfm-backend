import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidFileExtensionException extends BadRequestException {
  constructor(extension: string, allowedExtensions: string[]) {
    super(`Invalid file extension: ${extension}. Allowed extensions are: ${allowedExtensions.join(', ')}`);
  }
} 