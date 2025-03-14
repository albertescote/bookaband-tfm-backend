import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateChatRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  bandId: string;
}
