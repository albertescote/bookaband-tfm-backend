import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { InvoiceStatus } from "../../../context/invoice/domain/invoiceStatus";

export class CreateInvoiceRequestDto {
  @IsNotEmpty()
  @IsUUID()
  contractId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
