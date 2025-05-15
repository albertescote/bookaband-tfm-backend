import { InvoiceStatus } from "./invoiceStatus";
import InvoiceId from "./invoiceId";
import ContractId from "../../contract/domain/contractId";
import { InvalidInvoiceStatusException } from "../exceptions/invalidInvoiceStatusException";

export interface InvoicePrimitives {
  id: string;
  contractId: string;
  date: Date;
  amount: number;
  status: string;
}

export class Invoice {
  constructor(
    private id: InvoiceId,
    private contractId: ContractId,
    private date: Date,
    private amount: number,
    private status: InvoiceStatus,
  ) {}

  static fromPrimitives(primitives: InvoicePrimitives): Invoice {
    const status = InvoiceStatus[primitives.status];
    if (!status) {
      throw new InvalidInvoiceStatusException(primitives.status);
    }
    return new Invoice(
      new InvoiceId(primitives.id),
      new ContractId(primitives.contractId),
      new Date(primitives.date),
      primitives.amount,
      status,
    );
  }

  static create(
    contractId: ContractId,
    amount: number,
    status: InvoiceStatus,
  ): Invoice {
    return new Invoice(
      InvoiceId.generate(),
      contractId,
      new Date(),
      amount,
      status,
    );
  }

  toPrimitives(): InvoicePrimitives {
    return {
      id: this.id.toPrimitive(),
      contractId: this.contractId.toPrimitive(),
      date: this.date,
      amount: this.amount,
      status: this.status,
    };
  }
}
