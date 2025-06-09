import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateInvoiceRequestDto {
  @IsNotEmpty()
  @IsUUID()
  contractId: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
