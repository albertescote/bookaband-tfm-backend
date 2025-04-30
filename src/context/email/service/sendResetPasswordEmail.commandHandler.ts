import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Resend } from "resend";
import { FRONTEND_URL } from "../../../config";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { EmailVerification } from "../domain/emailVerification";
import { EmailVerificationRepository } from "../infrastructure/emailVerification.repository";
import { NotAbleToExecuteEmailVerificationDbTransactionException } from "../exceptions/notAbleToExecuteEmailVerificationDbTransactionException";
import EmailVerificationId from "../domain/emailVerificationId";
import { Languages } from "../../shared/domain/languages";
import { getPasswordTemplate } from "../domain/templates/templateResolver";
import { SendResetPasswordEmailCommand } from "./sendResetPasswordEmail.command";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";

const TOKEN_ISSUER = "BookaBand";
const TOKEN_EXPIRATION = 3600;

@Injectable()
@CommandHandler(SendResetPasswordEmailCommand)
export class SendResetPasswordEmailCommandHandler
  implements ICommandHandler<SendResetPasswordEmailCommand>
{
  private resend: Resend;
  constructor(
    @Inject("resend-api-key") resendApiKey: string,
    @Inject("JoseWrapperInitialized") private readonly joseWrapper: JoseWrapper,
    private emailVerificationRepository: EmailVerificationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {
    this.resend = new Resend(resendApiKey);
  }

  async execute(command: SendResetPasswordEmailCommand): Promise<void> {
    const { email, lng } = command;

    const user = await this.moduleConnectors.obtainUserInformation(
      undefined,
      email,
    );

    if (!user) {
      // Silently fail if the user is not found
      return;
    }

    const emailVerification = EmailVerification.create(
      user.getId(),
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

    const verificationUrl = `${FRONTEND_URL}/${lng}/reset-password?token=${token}`;
    const template = getPasswordTemplate(lng);

    await this.resend.emails.send({
      from: "BookaBand <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html(verificationUrl),
    });
  }
}
