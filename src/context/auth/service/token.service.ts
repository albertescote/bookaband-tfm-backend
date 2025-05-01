import { Inject, Injectable } from "@nestjs/common";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { InvalidTokenException } from "../exceptions/invalidTokenException";
import { InvalidTokenSubjectException } from "../exceptions/invalidTokenSubjectException";
import { TokenPayload } from "../domain/tokenPayload";
import { EmailNotVerifiedException } from "../exceptions/emailNotVerifiedException";
import { ResetPasswordSessionNotFoundException } from "../exceptions/resetPasswordSessionNotFoundException";
import { InvalidResetPasswordTokenException } from "../exceptions/invalidResetPasswordTokenException";
import { UserNotFoundException } from "../exceptions/userNotFoundException";

@Injectable()
export class TokenService {
  constructor(
    @Inject("JoseWrapperInitialized")
    private joseWrapper: JoseWrapper,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async signToken(
    payload: TokenPayload,
    issuer: string,
    expiresIn: number,
  ): Promise<string> {
    return this.joseWrapper.signJwt(payload, issuer, expiresIn);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    const validationResult = await this.joseWrapper.verifyJwt(token);
    if (!validationResult.valid) {
      throw new InvalidTokenException();
    }
    const tokenPayload = validationResult.decodedPayload as TokenPayload;
    const user = await this.moduleConnectors.obtainUserInformation(
      tokenPayload.sub,
    );
    if (!user) {
      throw new InvalidTokenSubjectException(tokenPayload.sub);
    }
    if (!user.isEmailVerified()) {
      throw new EmailNotVerifiedException();
    }
    return tokenPayload;
  }

  async verifyResetPasswordToken(token: string): Promise<TokenPayload> {
    const validationResult = await this.joseWrapper.verifyJwt(token);
    if (!validationResult.valid) {
      throw new InvalidTokenException();
    }
    const tokenPayload = validationResult.decodedPayload;

    if (!tokenPayload.sessionId) {
      throw new InvalidResetPasswordTokenException();
    }

    const resetPasswordSession =
      await this.moduleConnectors.getResetPasswordSession(
        tokenPayload.sessionId,
      );
    if (!resetPasswordSession) {
      throw new ResetPasswordSessionNotFoundException();
    }

    const user = await this.moduleConnectors.obtainUserInformation(
      resetPasswordSession.userId,
    );
    if (!user) {
      throw new UserNotFoundException(tokenPayload.sub);
    }

    const userPrimitives = user.toPrimitives();
    return {
      email: userPrimitives.email,
      sub: userPrimitives.id,
      role: userPrimitives.role,
    };
  }
}
