import { ContractStatus } from "./contractStatus";
import BookingId from "../../shared/domain/bookingId";
import ContractId from "../../shared/domain/contractId";
import { InvalidContractStatusException } from "../exceptions/invalidContractStatusException";

export interface ContractPrimitives {
  id: string;
  bookingId: string;
  status: string;
  fileUrl: string;
  userSigned: boolean;
  bandSigned: boolean;
  createdAt: Date;
  updatedAt: Date;

  eventName?: string;
  bandName?: string;
  userName?: string;
  eventDate?: Date;
}

export class Contract {
  constructor(
    private id: ContractId,
    private bookingId: BookingId,
    private status: ContractStatus,
    private fileUrl: string,
    private userSigned: boolean,
    private bandSigned: boolean,
    private createdAt: Date,
    private updatedAt: Date,
    private eventName?: string,
    private bandName?: string,
    private userName?: string,
    private eventDate?: Date,
  ) {}

  static fromPrimitives(primitives: ContractPrimitives): Contract {
    const status = ContractStatus[primitives.status];
    if (!status) {
      throw new InvalidContractStatusException(primitives.status);
    }
    return new Contract(
      new ContractId(primitives.id),
      new BookingId(primitives.bookingId),
      status,
      primitives.fileUrl,
      primitives.userSigned,
      primitives.bandSigned,
      primitives.createdAt,
      primitives.updatedAt,
      primitives.eventName,
      primitives.bandName,
      primitives.userName,
      primitives.eventDate,
    );
  }

  static create(bookingId: BookingId, fileUrl: string): Contract {
    const now = new Date();
    return new Contract(
      ContractId.generate(),
      bookingId,
      ContractStatus.PENDING,
      fileUrl,
      false,
      false,
      now,
      now,
    );
  }

  toPrimitives(): ContractPrimitives {
    return {
      id: this.id.toPrimitive(),
      bookingId: this.bookingId.toPrimitive(),
      status: this.status,
      fileUrl: this.fileUrl,
      userSigned: this.userSigned,
      bandSigned: this.bandSigned,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      eventName: this.eventName,
      bandName: this.bandName,
      userName: this.userName,
      eventDate: this.eventDate,
    };
  }

  getId() {
    return this.id;
  }

  getFileUrl() {
    return this.fileUrl;
  }

  getBookingId(): BookingId {
    return this.bookingId;
  }
}
