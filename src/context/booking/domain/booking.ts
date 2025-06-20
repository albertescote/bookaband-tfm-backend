import { BookingStatus } from "../../shared/domain/bookingStatus";
import UserId from "../../shared/domain/userId";
import BookingId from "../../shared/domain/bookingId";
import BandId from "../../shared/domain/bandId";

export interface BookingPrimitives {
  id: string;
  bandId: string;
  userId: string;
  status: BookingStatus;
  initDate: Date;
  endDate: Date;
  cost: number;
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
    private bandId: BandId,
    private userId: UserId,
    private status: BookingStatus,
    private initDate: Date,
    private endDate: Date,
    private cost: number,
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
      new BandId(primitives.bandId),
      new UserId(primitives.userId),
      primitives.status,
      primitives.initDate,
      primitives.endDate,
      primitives.cost,
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
    bandId: BandId,
    userId: UserId,
    initDate: Date,
    endDate: Date,
    cost: number,
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
      bandId,
      userId,
      BookingStatus.PENDING,
      initDate,
      endDate,
      cost,
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
      bandId: this.bandId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      status: this.status,
      initDate: this.initDate,
      endDate: this.endDate,
      cost: this.cost,
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

  cancel() {
    this.status = BookingStatus.CANCELED;
  }

  getId(): BookingId {
    return this.id;
  }

  getBandId(): BandId {
    return this.bandId;
  }

  getUserId(): UserId {
    return this.userId;
  }

  isClientOwner(userId: UserId): boolean {
    return this.userId.toPrimitive() === userId.toPrimitive();
  }

  contractSigned() {
    this.status = BookingStatus.SIGNED;
  }

  invoicePaid() {
    this.status = BookingStatus.PAID;
  }

  getStatus(): BookingStatus {
    return this.status;
  }
}
