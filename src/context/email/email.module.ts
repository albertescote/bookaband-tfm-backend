import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SendVerificationEmailCommandHandler } from "./service/sendVerificationEmail.commandHandler";
import { RESEND_API_KEY } from "../../config";

const ResendApiKey = {
  provide: "resend-api-key",
  useFactory: () => {
    return RESEND_API_KEY;
  },
};

@Module({
  imports: [CqrsModule],
  providers: [SendVerificationEmailCommandHandler, ResendApiKey],
  exports: [SendVerificationEmailCommandHandler],
})
export class EmailModule {}
