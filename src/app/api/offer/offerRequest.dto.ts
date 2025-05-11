import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";
import { BandSize } from "../../../context/offer/domain/bandSize";

export class OfferRequestDto {
  @IsNotEmpty()
  @IsString()
  bandId: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsBoolean()
  visible: boolean;

  @IsNotEmpty()
  @IsEnum(BandSize)
  bandSize: BandSize;

  @IsNotEmpty()
  @IsArray()
  eventTypeIds: string[];
}
