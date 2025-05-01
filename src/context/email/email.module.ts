import { Module } from "@nestjs/common";
import { EmailVerificationRepository } from "./infrastructure/emailVerification.repository";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { AUTHORIZE_SERVICE_PRIVATE_KEY } from "../auth/config";
import { VerifyEmailService } from "./service/verifyEmail.service";
import { SendVerificationEmailCommandHandler } from "./service/sendVerificationEmail.commandHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { JoseWrapper } from "../shared/infrastructure/joseWrapper";
import { REDIS, RESEND_API_KEY } from "../../config";
import { ResendVerificationEmailCommandHandler } from "./service/resendVerificationEmail.commandHandler";
import { SendResetPasswordEmailCommandHandler } from "./service/sendResetPasswordEmail.commandHandler";
import { ResetPasswordRepository } from "./infrastructure/resetPassword.repository";
import RedisService from "../shared/infrastructure/redis/redis.service";
import { GetResetPasswordSessionQueryHandler } from "./service/getResetPasswordSession.queryHandler";

const ResendApiKey = {
  provide: "resend-api-key",
  useFactory: () => {
    return RESEND_API_KEY;
  },
};

const redisConfig = {
  provide: "RedisConfig",
  useFactory: () => {
    return { prefix: "email-session:", port: REDIS.PORT, url: REDIS.URL };
  },
};

@Module({
  imports: [CqrsModule],
  providers: [
    EmailVerificationRepository,
    ResetPasswordRepository,
    PrismaService,
    ModuleConnectors,
    VerifyEmailService,
    ResendApiKey,
    RedisService,
    redisConfig,
    SendVerificationEmailCommandHandler,
    ResendVerificationEmailCommandHandler,
    SendResetPasswordEmailCommandHandler,
    GetResetPasswordSessionQueryHandler,
    {
      provide: "JoseWrapperInitialized",
      useFactory: () => {
        return new JoseWrapper(AUTHORIZE_SERVICE_PRIVATE_KEY);
      },
    },
  ],
  exports: [
    VerifyEmailService,
    SendVerificationEmailCommandHandler,
    ResendVerificationEmailCommandHandler,
    SendResetPasswordEmailCommandHandler,
    GetResetPasswordSessionQueryHandler,
  ],
})
export class EmailModule {}
