import { IsNotEmpty, IsString } from "class-validator";

export class LoginWithGoogleRequestDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
