import { v4 as uuidv4, validate } from "uuid";
import { InvalidChatIdFormatException } from "../exceptions/invalidChatIdFormatException";

export default class ChatId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidChatIdFormatException(value);
    }
  }

  static generate(): ChatId {
    return new ChatId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
