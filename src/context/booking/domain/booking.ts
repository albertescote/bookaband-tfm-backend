import { BookingStatus } from "./bookingStatus";
import OfferId from "../../shared/domain/offerId";
import UserId from "../../shared/domain/userId";
import BookingId from "./bookingId";

export interface BookingPrimitives {
  id: string;
  offerId: string;
  userId: string;
  status: BookingStatus;
  date: Date;
  createdAt: Date;
}

export class Booking {
  constructor(
    private id: BookingId,
    private offerId: OfferId,
    private userId: UserId,
    private status: BookingStatus,
    private date: Date,
    private createdAt?: Date,
  ) {}

  static fromPrimitives(primitives: BookingPrimitives): Booking {
    return new Booking(
      new BookingId(primitives.id),
      new OfferId(primitives.offerId),
      new UserId(primitives.userId),
      primitives.status,
      primitives.date,
      primitives.createdAt,
    );
  }

  static create(offerId: OfferId, userId: UserId, date: Date): Booking {
    return new Booking(
      BookingId.generate(),
      offerId,
      userId,
      BookingStatus.PENDING,
      date,
      new Date(),
    );
  }

  toPrimitives(): BookingPrimitives {
    return {
      id: this.id.toPrimitive(),
      offerId: this.offerId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      status: this.status,
      date: this.date,
      createdAt: this.createdAt,
    };
  }

  isOwner(userId: UserId) {
    return this.userId.toPrimitive() === userId.toPrimitive();
  }
}
