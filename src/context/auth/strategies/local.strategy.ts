import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UserInfoDtoPrimitives } from "../domain/userInfoDto";
import { InvalidEmailException } from "../exceptions/invalidEmailException";
import { InvalidPasswordException } from "../exceptions/invalidPasswordException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { PasswordService } from "../../shared/infrastructure/password.service";
import { EmailNotVerifiedException } from "../exceptions/emailNotVerifiedException";
import { InvalidAuthenticationMethodException } from "../exceptions/invalidAuthenticationMethodException";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private moduleConnectors: ModuleConnectors,
    private passwordService: PasswordService,
  ) {
    super({ usernameField: "email" });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<UserInfoDtoPrimitives> {
    const user = await this.moduleConnectors.obtainUserInformation(
      undefined,
      email,
    );
    if (!user) {
      throw new InvalidEmailException(email);
    }
    if (!user.isEmailVerified()) {
      throw new EmailNotVerifiedException();
    }

    if (!user.hasPassword()) {
      throw new InvalidAuthenticationMethodException();
    }

    const valid = await this.passwordService.comparePasswords(
      password,
      user.toPrimitives().password,
    );
    if (!valid) {
      throw new InvalidPasswordException();
    }
    const userPrimitives = user.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
    };
  }
}
