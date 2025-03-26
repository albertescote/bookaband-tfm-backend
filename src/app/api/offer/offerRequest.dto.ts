import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class OfferRequestDto {
  @IsNotEmpty()
  @IsString()
  bandId: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsBoolean()
  visible: boolean;

  @IsOptional()
  @IsString()
  description: string;
}
