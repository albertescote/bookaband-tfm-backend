import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOfferRequestDto {
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
