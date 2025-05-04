import { UnauthorizedException } from "../../../app/exceptions/unauthorizedException";

export class GoogleEmailNotVerifiedException extends UnauthorizedException {
  constructor() {
    super("Google email not verified");
  }
}
