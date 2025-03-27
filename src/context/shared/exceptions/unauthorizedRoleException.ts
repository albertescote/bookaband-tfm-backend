import { Role } from "../domain/role";
import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class UnauthorizedRoleException extends UnauthorizedException {
  constructor(role: string, authorizedRoles: Role[]) {
    super(`Unauthorized role: ${role}. Authorized roles: ${authorizedRoles}`);
  }
}
