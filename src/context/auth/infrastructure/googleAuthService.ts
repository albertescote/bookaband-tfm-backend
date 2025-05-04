import { Injectable } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { GoogleTokenExchangeException } from "../exceptions/googleTokenExchangeException";
import { GoogleTokenPayloadException } from "../exceptions/googleTokenPayloadException";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async exchangeCodeForToken(code: string): Promise<GetTokenResponse> {
    try {
      return await this.client.getToken(code);
    } catch (e) {
      throw new GoogleTokenExchangeException();
    }
  }

  getTokenPayload(token: string): AccessTokenPayload {
    try {
      return JoseWrapper.decodeJwt(token) as AccessTokenPayload;
    } catch (e) {
      throw new GoogleTokenPayloadException();
    }
  }
}
