import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class UnauthorizedRoleException extends ForbiddenException {
  constructor(role: string) {
    super(`Role ${role} is not authorized to perform this action`);
  }
} 