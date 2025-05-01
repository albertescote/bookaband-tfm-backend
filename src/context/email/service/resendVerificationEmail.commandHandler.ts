import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Resend } from "resend";
import { FRONTEND_URL } from "../../../config";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import UserId from "../../shared/domain/userId";
import { EmailVerificationRepository } from "../infrastructure/emailVerification.repository";
import EmailVerificationId from "../domain/emailVerificationId";
import { Language } from "../../shared/domain/languages";
import { getEmailVerificationTemplate } from "../domain/templates/templateResolver";
import { ResendVerificationEmailCommand } from "./resendVerificationEmail.command";
import { EmailVerificationNotFoundException } from "../exceptions/emailVerificationNotFoundException";
import { EmailAlreadyVerifiedException } from "../exceptions/emailAlreadyVerifiedException";

const TOKEN_ISSUER = "BookaBand";
const TOKEN_EXPIRATION = 3600;

@Injectable()
@CommandHandler(ResendVerificationEmailCommand)
export class ResendVerificationEmailCommandHandler
  implements ICommandHandler<ResendVerificationEmailCommand>
{
  private resend: Resend;
  constructor(
    @Inject("resend-api-key") resendApiKey: string,
    @Inject("JoseWrapperInitialized") private readonly joseWrapper: JoseWrapper,
    private emailVerificationRepository: EmailVerificationRepository,
  ) {
    this.resend = new Resend(resendApiKey);
  }

  async execute(command: ResendVerificationEmailCommand): Promise<void> {
    const { userId } = command;

    const storedEmailVerification =
      await this.emailVerificationRepository.getVerificationRecordByUserId(
        new UserId(userId),
      );

    if (!storedEmailVerification) {
      throw new EmailVerificationNotFoundException();
    }

    if (storedEmailVerification.toPrimitives().verified) {
      throw new EmailAlreadyVerifiedException();
    }

    storedEmailVerification.updateLastEmailSentAt();

    const emailVerificationPrimitives = storedEmailVerification.toPrimitives();
    await this.sendVerificationEmail(
      storedEmailVerification.getId(),
      emailVerificationPrimitives.email,
      storedEmailVerification.getLanguage(),
    );

    await this.emailVerificationRepository.updateVerificationRecord(
      storedEmailVerification,
    );
  }

  private async sendVerificationEmail(
    emailVerificationId: EmailVerificationId,
    email: string,
    lng: Language,
  ) {
    const token = await this.joseWrapper.signJwt(
      { emailVerificationId: emailVerificationId.toPrimitive() },
      TOKEN_ISSUER,
      TOKEN_EXPIRATION,
    );

    const verificationUrl = `${FRONTEND_URL}/${lng.toPrimitive()}/verify-email?token=${token}`;
    const template = getEmailVerificationTemplate(lng.toPrimitive());

    await this.resend.emails.send({
      from: "BookaBand <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html(verificationUrl),
    });
  }
}
