import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { BandRole } from "../../../context/band/domain/bandRole";
import { WeeklyAvailability } from "../../../context/band/domain/band";
import { HospitalityRider } from "../../../context/band/domain/band";
import { TechnicalRider } from "../../../context/band/domain/band";
import { PerformanceArea } from "../../../context/band/domain/band";

class BandMemberDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsEnum(BandRole)
  role: BandRole;
}

class WeeklyAvailabilityDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  monday: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tuesday: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  wednesday: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  thursday: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  friday: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  saturday: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  sunday: string[];
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

class PerformanceAreaDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  regions: string[];

  @IsNotEmpty()
  @IsString()
  travelPreferences: string;

  @IsOptional()
  @IsString()
  restrictions?: string;
}

export class UpdateBandRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  musicalStyleIds: string[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BandMemberDto)
  members: BandMemberDto[];

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
  description: string;

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
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => WeeklyAvailabilityDto)
  weeklyAvailability?: WeeklyAvailability;

  @IsOptional()
  @ValidateNested()
  @Type(() => HospitalityRiderDto)
  hospitalityRider?: HospitalityRider;

  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalRiderDto)
  technicalRider?: TechnicalRider;

  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceAreaDto)
  performanceArea?: PerformanceArea;
}
