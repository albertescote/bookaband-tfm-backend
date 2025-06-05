import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddBookingIntoChatCommand } from "./addBookingIntoChat.command";
import { ChatRepository } from "../infrastructure/chat.repository";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import Message from "../domain/message";
import MessageId from "../domain/messageId";
import Chat from "../domain/chat";
import ChatId from "../domain/chatId";
import { UnableToCreateChatException } from "../exceptions/unableToCreateChatException";

@Injectable()
@CommandHandler(AddBookingIntoChatCommand)
export class AddBookingIntoChatCommandHandler
  implements ICommandHandler<AddBookingIntoChatCommand>
{
  constructor(private chatRepository: ChatRepository) {}

  async execute(command: AddBookingIntoChatCommand): Promise<void> {
    const { userId, bandId, bookingId } = command;
    const chat = await this.chatRepository.getChatByUserIdAndBandId(
      new UserId(userId),
      new BandId(bandId),
    );
    const bookingMessage = Message.createNewBookingMessage({
      id: MessageId.generate().toPrimitive(),
      senderId: userId,
      recipientId: bandId,
      bookingId,
    });
    if (chat) {
      await this.chatRepository.addMessage(chat.getId(), bookingMessage, false);
    } else {
      const newChat = new Chat(
        ChatId.generate(),
        new UserId(userId),
        new BandId(bandId),
        [bookingMessage],
      );
      const createdChat = await this.chatRepository.createChat(newChat);
      if (!createdChat) {
        throw new UnableToCreateChatException();
      }
    }
  }
}
