import { Injectable } from "@nestjs/common";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  TOKEN_ISSUER,
  TOKEN_TYPE,
} from "../config";
import { RefreshTokenService } from "./refresh.service";
import { TokenPayload } from "../domain/tokenPayload";
import { TokenService } from "./token.service";

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
}
