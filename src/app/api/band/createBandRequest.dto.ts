import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { MusicGenre } from "../../../context/band/domain/musicGenre";
import { BandSize } from "../../../context/band/domain/bandSize";

export class CreateBandRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(MusicGenre)
  genre: MusicGenre;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsEnum(BandSize)
  bandSize: BandSize;

  @IsNotEmpty()
  @IsArray()
  eventTypeIds: string[];

  @IsOptional()
  @IsArray()
  membersId?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
