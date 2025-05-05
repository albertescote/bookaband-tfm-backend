import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "../../../context/shared/domain/role";

export class SignUpWithGoogleRequestDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
