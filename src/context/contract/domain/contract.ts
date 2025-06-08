import { ContractStatus } from "./contractStatus";
import BookingId from "../../shared/domain/bookingId";
import ContractId from "./contractId";
import { InvalidContractStatusException } from "../exceptions/invalidContractStatusException";

export interface ContractPrimitives {
  id: string;
  bookingId: string;
  date: Date;
  status: string;
  fileUrl: string;
}

export class Contract {
  constructor(
    private id: ContractId,
    private bookingId: BookingId,
    private date: Date,
    private status: ContractStatus,
    private fileUrl: string,
  ) {}

  static fromPrimitives(primitives: ContractPrimitives): Contract {
    const status = ContractStatus[primitives.status];
    if (!status) {
      throw new InvalidContractStatusException(primitives.status);
    }
    return new Contract(
      new ContractId(primitives.id),
      new BookingId(primitives.bookingId),
      new Date(primitives.date),
      status,
      primitives.fileUrl,
    );
  }

  static create(bookingId: BookingId, fileUrl: string): Contract {
    return new Contract(
      ContractId.generate(),
      bookingId,
      new Date(),
      ContractStatus.PENDING,
      fileUrl,
    );
  }

  toPrimitives(): ContractPrimitives {
    return {
      id: this.id.toPrimitive(),
      bookingId: this.bookingId.toPrimitive(),
      date: this.date,
      status: this.status,
      fileUrl: this.fileUrl,
    };
  }

  getId() {
    return this.id;
  }

  getFileUrl() {
    return this.fileUrl;
  }
}
