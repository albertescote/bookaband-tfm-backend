import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePaymentMethodRequestDto {
  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsNotEmpty()
  @IsString()
  providerId: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  lastFour: string;

  @IsNotEmpty()
  @IsBoolean()
  isDefault: boolean;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  alias?: string;
}
