import MessageId from "./messageId";
import RecipientId from "./recipientId";
import SenderId from "./senderId";
import { BookingStatus } from "../../shared/domain/bookingStatus";
import { InvalidMessageContentException } from "../exceptions/invalidMessageContentException";

export interface BookingMetadata {
  bookingId: string;
  bookingStatus?: BookingStatus;
  eventName?: string;
  eventDate?: Date;
  venue?: string;
  city?: string;
}

export interface MessagePrimitives {
  id: string;
  senderId: string;
  recipientId: string;
  message?: string;
  bookingMetadata?: BookingMetadata;
  fileUrl?: string;
  timestamp?: string | Date;
}

export default class Message {
  private constructor(
    private readonly id: MessageId,
    private readonly senderId: SenderId,
    private readonly recipientId: RecipientId,
    private readonly message?: string,
    private readonly bookingMetadata?: BookingMetadata,
    private readonly fileUrl?: string,
    private readonly timestamp?: Date,
  ) {
    if (!message && !bookingMetadata && !fileUrl) {
      throw new InvalidMessageContentException();
    }
  }

  static createNewTextMessage(data: {
    id: string;
    senderId: string;
    recipientId: string;
    message: string;
    fileUrl?: string;
  }) {
    return new Message(
      new MessageId(data.id),
      new SenderId(data.senderId),
      new RecipientId(data.recipientId),
      data.message,
      undefined,
      data.fileUrl,
    );
  }

  static createNewBookingMessage(data: {
    id: string;
    senderId: string;
    recipientId: string;
    bookingId: string;
  }) {
    return new Message(
      new MessageId(data.id),
      new SenderId(data.senderId),
      new RecipientId(data.recipientId),
      undefined,
      { bookingId: data.bookingId },
    );
  }

  static fromPrimitives(data: MessagePrimitives): Message {
    return new Message(
      new MessageId(data.id),
      new SenderId(data.senderId),
      new RecipientId(data.recipientId),
      data.message,
      data.bookingMetadata,
      data.fileUrl,
      data.timestamp ? new Date(data.timestamp) : undefined,
    );
  }

  toPrimitives(): MessagePrimitives {
    return {
      id: this.id.toPrimitive(),
      senderId: this.senderId.toPrimitive(),
      recipientId: this.recipientId.toPrimitive(),
      message: this.message,
      bookingMetadata: this.bookingMetadata,
      fileUrl: this.fileUrl,
      timestamp: this.timestamp?.toISOString(),
    };
  }
}
