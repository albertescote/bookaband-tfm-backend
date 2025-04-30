import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ResendEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
