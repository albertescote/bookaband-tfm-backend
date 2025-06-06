import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class NoFileUploadedException extends BadRequestException {
  constructor() {
    super("No file uploaded");
  }
}
