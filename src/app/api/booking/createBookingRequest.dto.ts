import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { IsStringDate } from "../../validators/isStringDateConstraint";

export class CreateBookingRequestDto {
  @IsNotEmpty()
  @IsUUID()
  bandId: string;

  @IsNotEmpty()
  @IsStringDate()
  initDate: string;

  @IsNotEmpty()
  @IsStringDate()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  cost: number;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  venue: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsUUID()
  eventTypeId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
