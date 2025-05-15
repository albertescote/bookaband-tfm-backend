import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { ContractStatus } from "../../../context/contract/domain/contractStatus";

export class CreateContractRequestDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status: ContractStatus;
}
