import { IsJWT, IsNotEmpty, IsString } from "class-validator";
import { VerificationStatus } from "../../../context/email/domain/verificationStatus";

export class VerifyEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsJWT()
  token: string;
}

export interface VerifyEmailResponseDto {
  status: VerificationStatus;
  message?: string;
}
