import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class WrongPermissionsException extends ForbiddenException {
  constructor(action: string) {
    super(
      `You don't have the right permissions to perform this action: ${action}`,
    );
  }
}
