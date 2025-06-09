export interface BookingInvoiceResponseDto {
  id: string;
  contractId: string;
  amount: number;
  status: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
