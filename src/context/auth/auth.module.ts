import { Module } from "@nestjs/common";
import { PasswordService } from "../shared/utils/password.service";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { LoginService } from "./service/login.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { CqrsModule } from "@nestjs/cqrs";
import {
  AUTHORIZE_SERVICE_PRIVATE_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "./config";
import { JoseWrapper } from "../shared/infrastructure/joseWrapper";
import { JwtCustomStrategy } from "./strategies/jwt-custom.strategy";
import { RefreshTokensRepository } from "./infrastructure/refreshTokens.repository";
import { RefreshTokenService } from "./service/refresh.service";
import { TokenService } from "./service/token.service";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { JwtResetPasswordStrategy } from "./strategies/jwt-reset-password.strategy";
import { GoogleAuthService } from "./infrastructure/googleAuthService";
import { FRONTEND_URL } from "../../config";

@Module({
  imports: [CqrsModule, PassportModule],
  providers: [
    PrismaService,
    LoginService,
    RefreshTokenService,
    TokenService,
    ModuleConnectors,
    PasswordService,
    LocalStrategy,
    JwtResetPasswordStrategy,
    JwtCustomStrategy,
    {
      provide: "JoseWrapperInitialized",
      useFactory: () => {
        return new JoseWrapper(AUTHORIZE_SERVICE_PRIVATE_KEY);
      },
    },
    {
      provide: "GoogleAuthServiceInitialized",
      useFactory: () => {
        return new GoogleAuthService(
          GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET,
          `${FRONTEND_URL}/federation/callback/google`,
        );
      },
    },

    RefreshTokensRepository,
  ],
  exports: [LoginService, RefreshTokenService],
})
export class AuthModule {}
