import { NotFoundException } from "../../../app/api/exceptions/notFoundException";

export class MemberIdNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`User not found for this id: ${id}`);
  }
}
