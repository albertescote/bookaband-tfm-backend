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
  name: string;
  country: string;
  city: string;
  venue: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  eventTypeId?: string;
  isPublic?: boolean;
}

export class Booking {
  constructor(
    private id: BookingId,
    private offerId: OfferId,
    private userId: UserId,
    private status: BookingStatus,
    private date: Date,
    private name: string,
    private country: string,
    private city: string,
    private venue: string,
    private postalCode: string,
    private addressLine1: string,
    private addressLine2?: string,
    private eventTypeId?: string,
    private isPublic?: boolean,
  ) {}

  static fromPrimitives(primitives: BookingPrimitives): Booking {
    return new Booking(
      new BookingId(primitives.id),
      new OfferId(primitives.offerId),
      new UserId(primitives.userId),
      primitives.status,
      primitives.date,
      primitives.name,
      primitives.country,
      primitives.city,
      primitives.venue,
      primitives.postalCode,
      primitives.addressLine1,
      primitives.addressLine2,
      primitives.eventTypeId,
      primitives.isPublic,
    );
  }

  static create(
    offerId: OfferId,
    userId: UserId,
    date: Date,
    name: string,
    country: string,
    city: string,
    venue: string,
    postalCode: string,
    addressLine1: string,
    addressLine2: string,
    eventTypeId: string,
    isPublic: boolean,
  ): Booking {
    return new Booking(
      BookingId.generate(),
      offerId,
      userId,
      BookingStatus.PENDING,
      date,
      name,
      country,
      city,
      venue,
      postalCode,
      addressLine1,
      addressLine2,
      eventTypeId,
      isPublic,
    );
  }

  toPrimitives(): BookingPrimitives {
    return {
      id: this.id.toPrimitive(),
      offerId: this.offerId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      status: this.status,
      date: this.date,
      name: this.name,
      country: this.country,
      city: this.city,
      venue: this.venue,
      postalCode: this.postalCode,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      eventTypeId: this.eventTypeId,
      isPublic: this.isPublic,
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
