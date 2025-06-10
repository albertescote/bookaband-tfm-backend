import { InvoiceStatus } from "./invoiceStatus";
import InvoiceId from "./invoiceId";
import ContractId from "../../shared/domain/contractId";
import { InvalidInvoiceStatusException } from "../exceptions/invalidInvoiceStatusException";

export interface InvoicePrimitives {
  id: string;
  contractId: string;
  amount: number;
  status: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Invoice {
  constructor(
    private id: InvoiceId,
    private contractId: ContractId,
    private amount: number,
    private status: InvoiceStatus,
    private fileUrl: string,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  static fromPrimitives(primitives: InvoicePrimitives): Invoice {
    const status = InvoiceStatus[primitives.status];
    if (!status) {
      throw new InvalidInvoiceStatusException(primitives.status);
    }
    return new Invoice(
      new InvoiceId(primitives.id),
      new ContractId(primitives.contractId),
      primitives.amount,
      status,
      primitives.fileUrl,
      primitives.createdAt,
      primitives.updatedAt,
    );
  }

  static create(
    contractId: ContractId,
    amount: number,
    fileUrl: string,
  ): Invoice {
    const now = new Date();
    return new Invoice(
      InvoiceId.generate(),
      contractId,
      amount,
      InvoiceStatus.PENDING,
      fileUrl,
      now,
      now,
    );
  }

  toPrimitives(): InvoicePrimitives {
    return {
      id: this.id.toPrimitive(),
      contractId: this.contractId.toPrimitive(),
      amount: this.amount,
      status: this.status,
      fileUrl: this.fileUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  paid(): void {
    this.status = InvoiceStatus.PAID;
  }

  getId(): InvoiceId {
    return this.id;
  }
}
