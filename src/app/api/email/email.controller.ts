import { Body, Controller, Post } from "@nestjs/common";
import {
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from "./verifyEmail.dto";
import { VerifyEmailService } from "../../../context/email/service/verifyEmail.service";
import { ResendEmailRequestDto } from "./resendEmail.dto";

@Controller("email")
export class EmailController {
  constructor(private readonly verifyEmailService: VerifyEmailService) {}

  @Post("verify")
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    return this.verifyEmailService.execute(verifyEmailDto.token);
  }

  @Post("resend")
  async resendEmail(
    @Body() verifyEmailDto: ResendEmailRequestDto,
  ): Promise<void> {
    return this.verifyEmailService.resendEmail(verifyEmailDto.userId);
  }
}
