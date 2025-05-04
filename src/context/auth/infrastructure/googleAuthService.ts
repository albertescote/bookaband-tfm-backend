import { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { GoogleTokenExchangeException } from "../exceptions/googleTokenExchangeException";
import { GoogleTokenPayloadException } from "../exceptions/googleTokenPayloadException";
import { OAuth2Client } from "google-auth-library";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export class GoogleAuthService {
  constructor(
    private clientId: string,
    private clientSecret: string,
  ) {}

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<GetTokenResponse> {
    try {
      const client = new OAuth2Client(
        this.clientId,
        this.clientSecret,
        redirectUri,
      );
      return await client.getToken(code);
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
