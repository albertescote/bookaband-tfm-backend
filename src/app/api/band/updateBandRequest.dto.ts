import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { MusicGenre } from "../../../context/band/domain/musicGenre";

export class UpdateBandRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(MusicGenre)
  genre: MusicGenre;

  @IsNotEmpty()
  @IsArray()
  membersId: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
