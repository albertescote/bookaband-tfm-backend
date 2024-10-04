import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateOfferRequestDto {
  @IsNotEmpty()
  @IsString()
  bandId: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description: string;
}
