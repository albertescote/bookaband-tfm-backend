import { BookingStatus } from "../../shared/domain/bookingStatus";
import BookingId from "../../shared/domain/bookingId";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";

export interface BookingWithDetailsPrimitives {
  id: string;
  bandId: string;
  userId: string;
  status: BookingStatus;
  initDate: Date;
  endDate: Date;
  cost: number;
  name: string;
  userName: string;
  bandName: string;
  userImageUrl?: string;
  bandImageUrl?: string;
  country: string;
  city: string;
  venue: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  eventTypeId?: string;
  isPublic?: boolean;
}

export class BookingWithDetails {
  constructor(
    private id: BookingId,
    private bandId: BandId,
    private userId: UserId,
    private status: BookingStatus,
    private initDate: Date,
    private endDate: Date,
    private cost: number,
    private name: string,
    private userName: string,
    private bandName: string,
    private country: string,
    private city: string,
    private venue: string,
    private postalCode: string,
    private addressLine1: string,
    private addressLine2?: string,
    private eventTypeId?: string,
    private isPublic?: boolean,
    private userImageUrl?: string,
    private bandImageUrl?: string,
  ) {}

  static fromPrimitives(
    primitives: BookingWithDetailsPrimitives,
  ): BookingWithDetails {
    return new BookingWithDetails(
      new BookingId(primitives.id),
      new BandId(primitives.bandId),
      new UserId(primitives.userId),
      primitives.status,
      primitives.initDate,
      primitives.endDate,
      primitives.cost,
      primitives.name,
      primitives.userName,
      primitives.bandName,
      primitives.country,
      primitives.city,
      primitives.venue,
      primitives.postalCode,
      primitives.addressLine1,
      primitives.addressLine2,
      primitives.eventTypeId,
      primitives.isPublic,
      primitives.userImageUrl,
      primitives.bandImageUrl,
    );
  }

  toPrimitives(): BookingWithDetailsPrimitives {
    return {
      id: this.id.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      status: this.status,
      initDate: this.initDate,
      endDate: this.endDate,
      name: this.name,
      cost: this.cost,
      userName: this.userName,
      bandName: this.bandName,
      country: this.country,
      city: this.city,
      venue: this.venue,
      postalCode: this.postalCode,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      eventTypeId: this.eventTypeId,
      isPublic: this.isPublic,
      userImageUrl: this.userImageUrl,
      bandImageUrl: this.bandImageUrl,
    };
  }

  isOwner(userId: UserId) {
    return this.userId.toPrimitive() === userId.toPrimitive();
  }

  getBandId() {
    return this.bandId;
  }

  getId() {
    return this.id;
  }
}
