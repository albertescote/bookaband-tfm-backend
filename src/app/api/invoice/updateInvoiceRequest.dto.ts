import { IsEnum, IsNotEmpty } from "class-validator";
import { InvoiceStatus } from "../../../context/invoice/domain/invoiceStatus";

export class UpdateInvoiceRequestDto {
  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
