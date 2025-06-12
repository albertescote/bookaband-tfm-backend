import NotificationId from "../../notification/domain/notificationId";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { InvitationStatus } from "../../shared/domain/invitationStatus";

interface InvitationMetadata {
  status: InvitationStatus;
  bandName: string;
  userName: string;
  createdAt?: Date;
}

interface BookingMetadata {
  bookingId: string;
  status: string;
  eventName: string;
  userName: string;
  bandName: string;
}

export interface NotificationPrimitives {
  id: string;
  bandId: string;
  userId: string;
  isReadFromBand: boolean;
  isReadFromUser: boolean;
  createdAt: string;
  invitationMetadata?: InvitationMetadata;
  bookingMetadata?: BookingMetadata;
}

export class Notification {
  constructor(
    private readonly id: NotificationId,
    private readonly bandId: BandId,
    private readonly userId: UserId,
    private isReadFromBand: boolean,
    private isReadFromUser: boolean,
    private readonly createdAt: Date,
    private readonly invitationMetadata?: InvitationMetadata,
    private readonly bookingMetadata?: BookingMetadata,
  ) {}

  public static fromPrimitives(
    primitives: NotificationPrimitives,
  ): Notification {
    return new Notification(
      new NotificationId(primitives.id),
      new BandId(primitives.bandId),
      new UserId(primitives.userId),
      primitives.isReadFromBand,
      primitives.isReadFromUser,
      new Date(primitives.createdAt),
      primitives.invitationMetadata,
      primitives.bookingMetadata,
    );
  }

  static createInvitationNotification(
    bandId: BandId,
    userId: UserId,
    invitationMetadata: InvitationMetadata,
  ): Notification {
    return new Notification(
      NotificationId.generate(),
      bandId,
      userId,
      false,
      false,
      new Date(),
      invitationMetadata,
    );
  }

  static createBookingNotification(
    bandId: BandId,
    userId: UserId,
    bookingMetadata: BookingMetadata,
  ): Notification {
    return new Notification(
      NotificationId.generate(),
      bandId,
      userId,
      false,
      false,
      new Date(),
      undefined,
      bookingMetadata,
    );
  }

  public toPrimitives(): NotificationPrimitives {
    return {
      id: this.id.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      isReadFromBand: this.isReadFromBand,
      isReadFromUser: this.isReadFromUser,
      createdAt: this.createdAt.toISOString(),
      invitationMetadata: this.invitationMetadata,
      bookingMetadata: this.bookingMetadata,
    };
  }

  public getId(): NotificationId {
    return this.id;
  }

  markAsReadFromUser() {
    this.isReadFromUser = true;
  }

  markAsReadFromBand() {
    this.isReadFromBand = true;
  }
}
