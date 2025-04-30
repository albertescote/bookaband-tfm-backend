import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import {
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from "./verifyEmail.dto";
import { VerifyEmailService } from "../../../context/email/service/verifyEmail.service";
import { ResendEmailRequestDto } from "./resendEmail.dto";
import { ResendVerificationEmailCommand } from "../../../context/email/service/resendVerificationEmail.command";
import { CommandBus } from "@nestjs/cqrs";
import { SendResetPasswordEmailCommand } from "../../../context/email/service/sendResetPasswordEmail.command";
import { ResetPasswordRequestDto } from "./resetPassword.dto";

@Controller("email")
export class EmailController {
  constructor(
    private readonly verifyEmailService: VerifyEmailService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post("verify")
  @HttpCode(201)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    return this.verifyEmailService.execute(verifyEmailDto.token);
  }

  @Post("resend")
  @HttpCode(201)
  async resendEmail(
    @Body() resendEmailDto: ResendEmailRequestDto,
  ): Promise<void> {
    const reSendVerificationEmailCommand = new ResendVerificationEmailCommand(
      resendEmailDto.userId,
    );
    await this.commandBus.execute(reSendVerificationEmailCommand);
  }

  @Post("password/reset")
  @HttpCode(201)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<void> {
    const reSendVerificationEmailCommand = new SendResetPasswordEmailCommand(
      resetPasswordDto.email,
      resetPasswordDto.lng,
    );
    await this.commandBus.execute(reSendVerificationEmailCommand);
  }
}
