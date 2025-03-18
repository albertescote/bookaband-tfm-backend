import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";

export class SendInvitationRequestDto {
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @IsNotEmpty()
  @IsUUID()
  bandId: string;
}
