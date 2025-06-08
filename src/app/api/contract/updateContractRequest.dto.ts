import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ContractStatus } from "../../../context/contract/domain/contractStatus";

export class UpdateContractRequestDto {
  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
