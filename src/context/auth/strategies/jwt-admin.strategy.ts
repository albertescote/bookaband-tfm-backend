import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { Request } from "express";
import { InvalidAuthorizationHeader } from "../exceptions/invalidAuthorizationHeader";
import { Strategy } from "passport-custom";
import { TokenService } from "../service/token.service";
import { Role } from "../../shared/domain/role";
import { UnauthorizedRoleException } from "../../shared/exceptions/unauthorizedRoleException";

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, "jwt-admin") {
  constructor(private tokenService: TokenService) {
    super();
  }

  async validate(req: Request): Promise<UserAuthInfo> {
    const accessToken = this.extractTokenFromHeader(req);
    if (!accessToken) {
      throw new InvalidAuthorizationHeader();
    }
    const accessTokenPayload = await this.tokenService.verifyToken(accessToken);
    if (accessTokenPayload.role !== Role.Admin) {
      throw new UnauthorizedRoleException(accessTokenPayload.role, [
        Role.Admin,
      ]);
    }
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
