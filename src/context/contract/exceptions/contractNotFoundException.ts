import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class ContractNotFoundException extends NotFoundException {
  constructor() {
    super("Contract not found");
  }
}
