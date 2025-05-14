import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdatePaymentMethodRequestDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

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
  @IsString()
  isDefault: boolean;

  @IsOptional()
  @IsString()
  brand?: string;
}
