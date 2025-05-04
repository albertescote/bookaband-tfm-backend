import { Injectable } from "@nestjs/common";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  TOKEN_ISSUER,
  TOKEN_TYPE,
} from "../config";
import { RefreshTokenService } from "./refresh.service";
import { TokenPayload } from "../domain/tokenPayload";
import { TokenService } from "./token.service";
import User from "../../shared/domain/user";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import {
  AccessTokenPayload,
  GoogleAuthService,
} from "../infrastructure/googleAuthService";
import { Role } from "../../shared/domain/role";
import { FRONTEND_URL } from "../../../config";
import { GoogleEmailNotVerifiedException } from "../exceptions/googleEmailNotVerifiedException";

export interface LoginRequest {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

@Injectable()
export class LoginService {
  constructor(
    private tokenService: TokenService,
    private refreshTokenService: RefreshTokenService,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async login(user: LoginRequest): Promise<LoginResponse> {
    const payload: TokenPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const signedAccessToken = await this.tokenService.signToken(
      payload,
      TOKEN_ISSUER,
      ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    );

    const signedRefreshToken =
      await this.refreshTokenService.createRefreshToken(payload, user.id);

    return {
      access_token: signedAccessToken,
      token_type: TOKEN_TYPE,
      expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refresh_token: signedRefreshToken,
    };
  }

  async loginWithGoogle(code: string, role?: Role): Promise<LoginResponse> {
    const googleAuthService = new GoogleAuthService(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
    );
    const tokenResponse = await googleAuthService.exchangeCodeForToken(
      code,
      role
        ? `${FRONTEND_URL}/federation/callback/google?role=${role}`
        : `${FRONTEND_URL}/federation/callback/google`,
    );

    const decodedToken = googleAuthService.getTokenPayload(
      tokenResponse.tokens.id_token,
    );
    if (!decodedToken.email_verified) {
      throw new GoogleEmailNotVerifiedException();
    }

    const user = await this.findOrCreateAccount(decodedToken);

    const payload = {
      email: decodedToken.email,
      sub: user.getId().toPrimitive(),
      role: user.getRole(),
    };

    const signedAccessToken = await this.tokenService.signToken(
      payload,
      TOKEN_ISSUER,
      ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    );

    const signedRefreshToken =
      await this.refreshTokenService.createRefreshToken(
        payload,
        user.getId().toPrimitive(),
      );

    return {
      access_token: signedAccessToken,
      token_type: TOKEN_TYPE,
      expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refresh_token: signedRefreshToken,
    };
  }

  private async findOrCreateAccount(
    decodedToken: AccessTokenPayload,
  ): Promise<User> {
    let user = await this.moduleConnectors.obtainUserInformation(
      undefined,
      decodedToken.email,
    );
    if (!user) {
      user = await this.moduleConnectors.createUser();
    }
    return user;
  }
}
