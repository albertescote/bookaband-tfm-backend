import { BookingStatus } from "./bookingStatus";
import OfferId from "../../shared/domain/offerId";
import UserId from "../../shared/domain/userId";
import BookingId from "../../shared/domain/bookingId";

export interface BookingPrimitives {
  id: string;
  offerId: string;
  userId: string;
  status: BookingStatus;
  date: Date;
}

export class Booking {
  constructor(
    private id: BookingId,
    private offerId: OfferId,
    private userId: UserId,
    private status: BookingStatus,
    private date: Date,
  ) {}

  static fromPrimitives(primitives: BookingPrimitives): Booking {
    return new Booking(
      new BookingId(primitives.id),
      new OfferId(primitives.offerId),
      new UserId(primitives.userId),
      primitives.status,
      primitives.date,
    );
  }

  static create(offerId: OfferId, userId: UserId, date: Date): Booking {
    return new Booking(
      BookingId.generate(),
      offerId,
      userId,
      BookingStatus.PENDING,
      date,
    );
  }

  toPrimitives(): BookingPrimitives {
    return {
      id: this.id.toPrimitive(),
      offerId: this.offerId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      status: this.status,
      date: this.date,
    };
  }

  isPending(): boolean {
    return this.status === BookingStatus.PENDING;
  }

  accept() {
    this.status = BookingStatus.ACCEPTED;
  }

  decline() {
    this.status = BookingStatus.DECLINED;
  }

  getOfferId() {
    return this.offerId;
  }

  getId() {
    return this.id;
  }
}
