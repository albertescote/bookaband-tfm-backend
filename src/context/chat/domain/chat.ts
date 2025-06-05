import Message, { MessagePrimitives } from "./message";
import ChatId from "./chatId";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";

export interface ChatPrimitives {
  id: string;
  userId: string;
  bandId: string;
  messages: MessagePrimitives[];
}

export default class Chat {
  private readonly messages: Message[];

  constructor(
    private readonly id: ChatId,
    private readonly userId: UserId,
    private readonly bandId: BandId,
    messages: Message[] = [],
  ) {
    this.messages = messages;
  }

  static fromPrimitives(data: ChatPrimitives): Chat {
    const messages = data.messages.map((msg) => Message.fromPrimitives(msg));
    return new Chat(
      new ChatId(data.id),
      new UserId(data.userId),
      new BandId(data.bandId),
      messages,
    );
  }

  toPrimitives(): ChatPrimitives {
    return {
      id: this.id.toPrimitive(),
      userId: this.userId.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      messages: this.messages.map((msg) => msg.toPrimitives()),
    };
  }

  isOwner(id: string) {
    return this.userId.toPrimitive() === id || this.bandId.toPrimitive() === id;
  }

  getId(): ChatId {
    return this.id;
  }
}
