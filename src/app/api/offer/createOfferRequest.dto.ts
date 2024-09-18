import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { MusicGenre } from "../../../context/offer/domain/musicGenre";

export class CreateOfferRequestDto {
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  bandName: string;

  @IsNotEmpty()
  @IsEnum(MusicGenre)
  genre: MusicGenre;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}
