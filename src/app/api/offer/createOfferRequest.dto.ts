import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateOfferRequestDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
