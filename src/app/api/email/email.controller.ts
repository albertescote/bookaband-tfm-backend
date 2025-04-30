import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import {
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from "./verifyEmail.dto";
import { VerifyEmailService } from "../../../context/email/service/verifyEmail.service";
import { ResendEmailRequestDto } from "./resendEmail.dto";
import { ResendVerificationEmailCommand } from "../../../context/email/service/resendVerificationEmail.command";
import { CommandBus } from "@nestjs/cqrs";

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
    @Body() verifyEmailDto: ResendEmailRequestDto,
  ): Promise<void> {
    const reSendVerificationEmailCommand = new ResendVerificationEmailCommand(
      verifyEmailDto.userId,
    );
    await this.commandBus.execute(reSendVerificationEmailCommand);
  }
}
