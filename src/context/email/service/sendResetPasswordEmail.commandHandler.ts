import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Resend } from "resend";
import { FRONTEND_URL } from "../../../config";
import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { Languages } from "../../shared/domain/languages";
import { getResetPasswordTemplate } from "../domain/templates/templateResolver";
import { SendResetPasswordEmailCommand } from "./sendResetPasswordEmail.command";
import { ResetPasswordRepository } from "../infrastructure/resetPassword.repository";
import { ResetPasswordSession } from "../domain/resetPasswordSession";
import SessionId from "../domain/sessionId";
import UserId from "../../shared/domain/userId";

const TOKEN_ISSUER = "BookaBand";
const TOKEN_EXPIRATION = 1800;

@Injectable()
@CommandHandler(SendResetPasswordEmailCommand)
export class SendResetPasswordEmailCommandHandler
  implements ICommandHandler<SendResetPasswordEmailCommand>
{
  private resend: Resend;
  constructor(
    @Inject("resend-api-key") resendApiKey: string,
    @Inject("JoseWrapperInitialized") private readonly joseWrapper: JoseWrapper,
    private resetPasswordRepository: ResetPasswordRepository,
  ) {
    this.resend = new Resend(resendApiKey);
  }

  async execute(command: SendResetPasswordEmailCommand): Promise<void> {
    const { email, lng, userId } = command;

    const resetPasswordSession = ResetPasswordSession.create(
      new UserId(userId),
      lng,
    );

    await this.resetPasswordRepository.save(resetPasswordSession);

    await this.sendVerificationEmail(
      resetPasswordSession.getSessionId(),
      email,
      lng,
    );
  }

  private async sendVerificationEmail(
    sessionId: SessionId,
    email: string,
    lng: Languages,
  ) {
    const token = await this.joseWrapper.signJwt(
      { sessionId: sessionId.toPrimitive() },
      TOKEN_ISSUER,
      TOKEN_EXPIRATION,
    );

    const verificationUrl = `${FRONTEND_URL}/${lng}/reset-password?token=${token}`;
    const template = getResetPasswordTemplate(lng);

    await this.resend.emails.send({
      from: "BookaBand <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html(verificationUrl),
    });
  }
}
