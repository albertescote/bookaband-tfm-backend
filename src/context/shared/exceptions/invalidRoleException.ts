import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class InvalidRoleException extends BadRequestException {
  constructor(role: string) {
    super(`Invalid role: ${role}`);
  }
}
