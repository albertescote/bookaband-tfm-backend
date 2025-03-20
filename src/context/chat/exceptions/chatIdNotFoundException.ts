import { NotFoundException } from "../../../app/exceptions/notFoundException";

export class ChatIdNotFoundException extends NotFoundException {
  constructor(chatId: string) {
    super(`Chat not found for this id: ${chatId}`);
  }
}
