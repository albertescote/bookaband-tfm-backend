import { BookingStatus } from "./bookingStatus";
import BookingId from "../../shared/domain/bookingId";
import OfferId from "../../shared/domain/offerId";
import UserId from "../../shared/domain/userId";

export interface BookingWithDetailsPrimitives {
  id: string;
  offerId: string;
  userId: string;
  status: BookingStatus;
  date: Date;
  userName: string;
  bandName: string;
  userImageUrl?: string;
  bandImageUrl?: string;
}

export class BookingWithDetails {
  constructor(
    private id: BookingId,
    private offerId: OfferId,
    private userId: UserId,
    private status: BookingStatus,
    private date: Date,
    private userName: string,
    private bandName: string,
    private userImageUrl?: string,
    private bandImageUrl?: string,
  ) {}

  static fromPrimitives(
    primitives: BookingWithDetailsPrimitives,
  ): BookingWithDetails {
    return new BookingWithDetails(
      new BookingId(primitives.id),
      new OfferId(primitives.offerId),
      new UserId(primitives.userId),
      primitives.status,
      primitives.date,
      primitives.userName,
      primitives.bandName,
      primitives.userImageUrl,
      primitives.bandImageUrl,
    );
  }

  toPrimitives(): BookingWithDetailsPrimitives {
    return {
      id: this.id.toPrimitive(),
      offerId: this.offerId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      status: this.status,
      date: this.date,
      userName: this.userName,
      bandName: this.bandName,
      userImageUrl: this.userImageUrl,
      bandImageUrl: this.bandImageUrl,
    };
  }

  isOwner(userId: UserId) {
    return this.userId.toPrimitive() === userId.toPrimitive();
  }

  getOfferId() {
    return this.offerId;
  }

  getId() {
    return this.id;
  }
}
