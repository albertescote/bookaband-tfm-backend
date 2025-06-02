import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  familyName: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}
