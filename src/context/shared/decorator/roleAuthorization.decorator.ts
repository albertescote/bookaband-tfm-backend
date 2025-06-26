import { Role } from "../domain/role";
import { UserAuthInfo } from "../domain/userAuthInfo";
import { UnauthorizedRoleException } from "../exceptions/unauthorizedRoleException";
import { InvalidRoleException } from "../exceptions/invalidRoleException";
import { AuthorizedCommand } from "../domain/authorizedCommand";

export const RoleAuth = (authorizedRoles: Role[]) => {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const decoratedMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const authInfo = args[0] as UserAuthInfo;

      const role = getRoleFromAuthInfo(authInfo);
      if (!authorizedRoles.includes(role)) {
        throw new UnauthorizedRoleException(authInfo.role, authorizedRoles);
      }
      return decoratedMethod.apply(this, args);
    };
  };
};

export const RoleAuthCQRS = (authorizedRoles: Role[]) => {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const decoratedMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const { authorized } = args[0] as AuthorizedCommand;

      const role = getRoleFromAuthInfo(authorized);
      if (!authorizedRoles.includes(role)) {
        throw new UnauthorizedRoleException(authorized.role, authorizedRoles);
      }
      return decoratedMethod.apply(this, args);
    };
  };
};

const getRoleFromAuthInfo = (authInfo: UserAuthInfo): Role => {
  const role = Role[authInfo.role];
  if (!role) {
    throw new InvalidRoleException(authInfo.role);
  }
  return role;
};
