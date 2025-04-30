import { Module } from "@nestjs/common";
import { EmailVerificationRepository } from "./infrastructure/emailVerification.repository";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { AUTHORIZE_SERVICE_PRIVATE_KEY } from "../auth/config";
import { VerifyEmailService } from "./service/verifyEmail.service";
import { SendVerificationEmailCommandHandler } from "./service/sendVerificationEmail.commandHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { JoseWrapper } from "../shared/infrastructure/joseWrapper";
import { RESEND_API_KEY } from "../../config";
import { ResendVerificationEmailCommandHandler } from "./service/resendVerificationEmail.commandHandler";

const ResendApiKey = {
  provide: "resend-api-key",
  useFactory: () => {
    return RESEND_API_KEY;
  },
};

@Module({
  imports: [CqrsModule],
  providers: [
    EmailVerificationRepository,
    PrismaService,
    ModuleConnectors,
    VerifyEmailService,
    ResendApiKey,
    SendVerificationEmailCommandHandler,
    ResendVerificationEmailCommandHandler,
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
  ],
})
export class EmailModule {}
