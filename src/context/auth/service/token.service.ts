import { Inject, Injectable } from "@nestjs/common";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { InvalidTokenException } from "../exceptions/invalidTokenException";
import { InvalidTokenSubjectException } from "../exceptions/invalidTokenSubjectException";
import { TokenPayload } from "../domain/tokenPayload";
import { EmailNotVerifiedException } from "../exceptions/emailNotVerifiedException";

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
}
