import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ContractStatus } from "../../../context/contract/domain/contractStatus";

export class CreateContractRequestDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
