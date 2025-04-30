import { ForbiddenException } from "../../../app/exceptions/forbiddenException";

export class EmailNotVerifiedException extends ForbiddenException {
  constructor() {
    super(`Email not verified yet`);
  }
}
