import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  HospitalityRider,
  PerformanceArea,
  TechnicalRider,
  WeeklyAvailability,
} from "../../../context/band/domain/band";

class WeeklyAvailabilityDto {
  @IsNotEmpty()
  @IsBoolean()
  monday: boolean;

  @IsNotEmpty()
  @IsBoolean()
  tuesday: boolean;

  @IsNotEmpty()
  @IsBoolean()
  wednesday: boolean;

  @IsNotEmpty()
  @IsBoolean()
  thursday: boolean;

  @IsNotEmpty()
  @IsBoolean()
  friday: boolean;

  @IsNotEmpty()
  @IsBoolean()
  saturday: boolean;

  @IsNotEmpty()
  @IsBoolean()
  sunday: boolean;
}

class HospitalityRiderDto {
  @IsNotEmpty()
  @IsString()
  accommodation: string;

  @IsNotEmpty()
  @IsString()
  catering: string;

  @IsNotEmpty()
  @IsString()
  beverages: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

class TechnicalRiderDto {
  @IsNotEmpty()
  @IsString()
  soundSystem: string;

  @IsNotEmpty()
  @IsString()
  microphones: string;

  @IsNotEmpty()
  @IsString()
  backline: string;

  @IsNotEmpty()
  @IsString()
  lighting: string;

  @IsOptional()
  @IsString()
  otherRequirements?: string;
}

class GasPriceCalculationDto {
  @IsNotEmpty()
  @IsNumber()
  fuelConsumption: number;

  @IsNotEmpty()
  @IsBoolean()
  useDynamicPricing: boolean;

  @IsOptional()
  @IsNumber()
  pricePerLiter?: number;
}

class PerformanceAreaDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  regions: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GasPriceCalculationDto)
  gasPriceCalculation?: GasPriceCalculationDto;

  @IsOptional()
  @IsString()
  otherComments?: string;
}

class MediaDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}

class SocialLinkDto {
  @IsNotEmpty()
  @IsString()
  platform: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}

export class UpsertBandRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  musicalStyleIds: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  bandSize: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  eventTypeIds: string[];

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => WeeklyAvailabilityDto)
  weeklyAvailability: WeeklyAvailability;

  @IsOptional()
  @ValidateNested()
  @Type(() => HospitalityRiderDto)
  hospitalityRider?: HospitalityRider;

  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalRiderDto)
  technicalRider?: TechnicalRider;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PerformanceAreaDto)
  performanceArea: PerformanceArea;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media?: MediaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];
}
