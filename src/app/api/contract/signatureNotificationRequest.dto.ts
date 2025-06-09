import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class SignerDto {
  @IsOptional()
  @IsString()
  UserNoticesInfo?: string | null;

  @IsOptional()
  @IsString()
  FormInfo?: string | null;

  @IsString()
  SignerGUI: string;

  @IsString()
  SignerName: string;

  @IsString()
  SignatureStatus: string;

  @IsOptional()
  @IsString()
  RejectionReason?: string | null;

  @IsString()
  TypeOfID: string;

  @IsString()
  NumberID: string;

  @IsString()
  @IsOptional()
  OperationTime: string;
}

export class SignatureNotificationRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignerDto)
  Signers: SignerDto[];

  @IsString()
  FileName: string;

  @IsString()
  DocGUI: string;

  @IsString()
  DocStatus: string;

  @IsBoolean()
  Downloaded: boolean;

  @IsOptional()
  @IsString()
  AdditionalData?: string;
}
