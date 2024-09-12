import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateOfferRequestDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
