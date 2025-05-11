import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { Request } from "express";
import { Strategy } from "passport-custom";
import { TokenService } from "../service/token.service";

@Injectable()
export class JwtOptionalStrategy extends PassportStrategy(
  Strategy,
  "jwt-optional",
) {
  constructor(private tokenService: TokenService) {
    super();
  }

  async validate(req: Request): Promise<UserAuthInfo> {
    const accessToken = this.extractTokenFromHeader(req);
    if (!accessToken) {
      return { email: undefined, id: undefined, role: undefined };
    }
    const accessTokenPayload = await this.tokenService.verifyToken(accessToken);
    return {
      email: accessTokenPayload.email,
      id: accessTokenPayload.sub,
      role: accessTokenPayload.role,
    };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
