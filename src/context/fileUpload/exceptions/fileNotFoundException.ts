import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class FileNotFoundException extends NotFoundException {
  constructor() {
    super(`File not found`);
  }
}
