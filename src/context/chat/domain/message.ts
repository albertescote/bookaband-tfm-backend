import MessageId from "./messageId";
import RecipientId from "./recipientId";
import SenderId from "./senderId";
import { BookingStatus } from "../../shared/domain/bookingStatus";
import { InvalidMessageContentException } from "../exceptions/invalidMessageContentException";

export interface MessageMetadata {
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
  metadata?: MessageMetadata;
  timestamp?: string | Date;
}

export default class Message {
  private constructor(
    private readonly id: MessageId,
    private readonly senderId: SenderId,
    private readonly recipientId: RecipientId,
    private readonly message?: string,
    private readonly metadata?: MessageMetadata,
    private readonly timestamp?: Date,
  ) {
    if (!message && !metadata) {
      throw new InvalidMessageContentException();
    }
  }

  static createNewTextMessage(data: {
    id: string;
    senderId: string;
    recipientId: string;
    message: string;
  }) {
    return new Message(
      new MessageId(data.id),
      new SenderId(data.senderId),
      new RecipientId(data.recipientId),
      data.message,
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
      data.metadata,
      data.timestamp ? new Date(data.timestamp) : undefined,
    );
  }

  toPrimitives(): MessagePrimitives {
    return {
      id: this.id.toPrimitive(),
      senderId: this.senderId.toPrimitive(),
      recipientId: this.recipientId.toPrimitive(),
      message: this.message,
      metadata: this.metadata,
      timestamp: this.timestamp?.toISOString(),
    };
  }
}
