import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SendVerificationEmailCommand } from "./sendVerificationEmail.command";
import { Resend } from "resend";
import { FRONTEND_AUTH_URL } from "../../../config";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { EmailVerification } from "../domain/emailVerification";
import UserId from "../../shared/domain/userId";
import { EmailVerificationRepository } from "../infrastructure/emailVerification.repository";
import { NotAbleToExecuteEmailVerificationDbTransactionException } from "../exceptions/notAbleToExecuteEmailVerificationDbTransactionException";
import EmailVerificationId from "../domain/emailVerificationId";
import { Languages } from "../../shared/domain/languages";
import { getEmailVerificationTemplate } from "../domain/templates/templateResolver";

const TOKEN_ISSUER = "BookaBand";
const TOKEN_EXPIRATION = 3600;

@Injectable()
@CommandHandler(SendVerificationEmailCommand)
export class SendVerificationEmailCommandHandler
  implements ICommandHandler<SendVerificationEmailCommand>
{
  private resend: Resend;
  constructor(
    @Inject("resend-api-key") resendApiKey: string,
    @Inject("JoseWrapperInitialized") private readonly joseWrapper: JoseWrapper,
    private emailVerificationRepository: EmailVerificationRepository,
  ) {
    this.resend = new Resend(resendApiKey);
  }

  async execute(command: SendVerificationEmailCommand): Promise<void> {
    const { email, userId, lng } = command;
    const emailVerification = EmailVerification.create(
      new UserId(userId),
      lng,
      email,
    );

    const storedEmailVerification =
      await this.emailVerificationRepository.createVerificationRecord(
        emailVerification,
      );
    if (!storedEmailVerification) {
      throw new NotAbleToExecuteEmailVerificationDbTransactionException(
        `create verification record`,
      );
    }

    await this.sendVerificationEmail(
      storedEmailVerification.getId(),
      email,
      lng,
    );
  }

  private async sendVerificationEmail(
    emailVerificationId: EmailVerificationId,
    email: string,
    lng: Languages,
  ) {
    const token = await this.joseWrapper.signJwt(
      { emailVerificationId: emailVerificationId.toPrimitive() },
      TOKEN_ISSUER,
      TOKEN_EXPIRATION,
    );

    const verificationUrl = `${FRONTEND_AUTH_URL}/${lng}/verify-email?token=${token}`;
    const template = getEmailVerificationTemplate(lng);

    await this.resend.emails.send({
      from: "BookaBand <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html(verificationUrl),
    });
  }
}
