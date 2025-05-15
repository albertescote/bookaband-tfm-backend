import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdatePaymentMethodRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  isDefault: boolean;

  @IsOptional()
  @IsString()
  alias?: string;
}
