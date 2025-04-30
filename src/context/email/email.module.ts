import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SendVerificationEmailCommandHandler } from "./service/sendVerificationEmail.commandHandler";
import { VerifyEmailService } from "./service/verifyEmail.service";
import { RESEND_API_KEY } from "../../config";
import { JoseWrapper } from "../shared/infrastructure/joseWrapper";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { AUTHORIZE_SERVICE_PRIVATE_KEY } from "../auth/config";

const ResendApiKey = {
  provide: "resend-api-key",
  useFactory: () => {
    return RESEND_API_KEY;
  },
};

@Module({
  imports: [CqrsModule],
  providers: [
    SendVerificationEmailCommandHandler,
    VerifyEmailService,
    ResendApiKey,
    ModuleConnectors,
    {
      provide: "JoseWrapperInitialized",
      useFactory: () => {
        return new JoseWrapper(AUTHORIZE_SERVICE_PRIVATE_KEY);
      },
    },
  ],
  exports: [VerifyEmailService, SendVerificationEmailCommandHandler],
})
export class EmailModule {}
