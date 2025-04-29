import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SendVerificationEmailCommand } from "./sendVerificationEmail.command";
import { Resend } from "resend";
import { FRONTEND_URL } from "../../../config";

@Injectable()
@CommandHandler(SendVerificationEmailCommand)
export class SendVerificationEmailCommandHandler
  implements ICommandHandler<SendVerificationEmailCommand>
{
  private resend: Resend;
  constructor(@Inject("resend-api-key") resendApiKey: string) {
    this.resend = new Resend(resendApiKey);
  }

  async execute(command: SendVerificationEmailCommand): Promise<void> {
    const { to, token } = command;
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: "BookaBand <onboarding@resend.dev>",
      to,
      subject: "Confirma el teu correu electrònic",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Benvingut a BookaBand!</h2>
          <p>Fes clic en aquest enllaç per confirmar el teu correu electrònic:</p>
          <a href="${verificationUrl}" style="color: #15b7b9;">Confirmar correu</a>
        </div>
      `,
    });
  }
}
