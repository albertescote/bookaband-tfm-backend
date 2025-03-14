import MessageId from "./messageId";
import RecipientId from "./recipientId";
import SenderId from "./senderId";

export interface MessagePrimitives {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp?: string | Date;
}

export default class Message {
  private constructor(
    private readonly id: MessageId,
    private readonly senderId: SenderId,
    private readonly recipientId: RecipientId,
    private content: string,
    private readonly timestamp?: Date,
  ) {}

  static createNew(data: {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
  }) {
    return new Message(
      new MessageId(data.id),
      new SenderId(data.senderId),
      new RecipientId(data.recipientId),
      data.content,
    );
  }

  static fromPrimitives(data: MessagePrimitives): Message {
    return new Message(
      new MessageId(data.id),
      new SenderId(data.senderId),
      new RecipientId(data.recipientId),
      data.content,
      new Date(data.timestamp),
    );
  }

  toPrimitives(): MessagePrimitives {
    return {
      id: this.id.toPrimitive(),
      senderId: this.senderId.toPrimitive(),
      recipientId: this.recipientId.toPrimitive(),
      content: this.content,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
