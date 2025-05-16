import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { IsStringDate } from "../../validators/isStringDateConstraint";

export class CreateBookingRequestDto {
  @IsNotEmpty()
  @IsUUID()
  offerId: string;

  @IsNotEmpty()
  @IsStringDate()
  date: string;

  @IsNotEmpty()
  @IsString()
  name: string;

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
