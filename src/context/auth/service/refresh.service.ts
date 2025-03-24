import { Injectable } from "@nestjs/common";
import { RefreshTokensRepository } from "../infrastructure/refreshTokens.repository";
import { RefreshToken } from "../domain/refreshToken";
import UserId from "../../shared/domain/userId";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  TOKEN_ISSUER,
  TOKEN_TYPE,
} from "../config";
import { TokenService } from "./token.service";
import { TokenPayload } from "../domain/tokenPayload";
import { RefreshTokenNotFoundException } from "../exceptions/refreshTokenNotFoundException";
import { NotAbleToExecuteRefreshTokenDbTransactionException } from "../exceptions/notAbleToExecuteRefreshTokenDbTransactionException";

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private tokenService: TokenService,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const storedRefreshToken =
      await this.refreshTokensRepository.findRefreshToken(refreshToken);
    if (!storedRefreshToken) {
      throw new RefreshTokenNotFoundException();
    }
    const tokenPayload = await this.tokenService.verifyToken(refreshToken);

    const signedAccessToken = await this.tokenService.signToken(
      tokenPayload,
      TOKEN_ISSUER,
      ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    );

    return {
      access_token: signedAccessToken,
      token_type: TOKEN_TYPE,
      expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  async createRefreshToken(
    payload: TokenPayload,
    userId: string,
  ): Promise<string> {
    const signedRefreshToken = await this.tokenService.signToken(
      payload,
      TOKEN_ISSUER,
      REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    );

    const refreshToken = RefreshToken.create(
      signedRefreshToken,
      new UserId(userId),
    );
    await this.refreshTokensRepository.createRefreshToken(refreshToken);

    return signedRefreshToken;
  }

  async logout(refreshToken: string): Promise<void> {
    const storedRefreshToken =
      await this.refreshTokensRepository.findRefreshToken(refreshToken);
    if (!storedRefreshToken) {
      throw new RefreshTokenNotFoundException();
    }
    const deleted =
      await this.refreshTokensRepository.deleteRefreshToken(refreshToken);
    if (!deleted) {
      throw new NotAbleToExecuteRefreshTokenDbTransactionException("logout");
    }
  }
}
