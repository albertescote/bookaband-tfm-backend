import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "../../../context/shared/domain/role";

export class LoginWithGoogleRequestDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
