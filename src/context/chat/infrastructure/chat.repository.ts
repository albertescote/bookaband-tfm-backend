import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Chat from "../domain/chat";
import ChatId from "../domain/chatId";
import Message, { MessagePrimitives } from "../domain/message";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";

export interface AllChatsView {
  messages: MessagePrimitives[];
  user: { id: string; firstName: string; familyName: string };
  band: { id: string; name: string };
}

@Injectable()
export class ChatRepository {
  constructor(private prismaService: PrismaService) {}

  async createChat(chat: Chat): Promise<Chat> {
    const chatPrimitives = chat.toPrimitives();
    try {
      await this.prismaService.chat.create({
        data: {
          id: chatPrimitives.id,
          userId: chatPrimitives.userId,
          bandId: chatPrimitives.bandId,
        },
      });
      return chat;
    } catch (e) {
      return undefined;
    }
  }

  async addMessage(chatId: ChatId, message: Message) {
    const messagePrimitives = message.toPrimitives();
    await this.prismaService.message.create({
      data: {
        id: messagePrimitives.id,
        chatId: chatId.toPrimitive(),
        senderId: messagePrimitives.senderId,
        recipientId: messagePrimitives.recipientId,
        content: messagePrimitives.content,
      },
    });
  }

  async getChatById(id: ChatId): Promise<Chat> {
    const chat = await this.prismaService.chat.findFirst({
      where: { id: id.toPrimitive() },
    });
    const messages = await this.prismaService.message.findMany({
      where: { chatId: chat.id },
      orderBy: { timestamp: "asc" },
    });
    return chat
      ? Chat.fromPrimitives({
          id: chat.id,
          userId: chat.userId,
          bandId: chat.bandId,
          messages,
        })
      : undefined;
  }

  async getUserChats(userId: UserId): Promise<AllChatsView[]> {
    return this.prismaService.chat.findMany({
      where: {
        userId: userId.toPrimitive(),
      },
      include: {
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        user: { select: { id: true, firstName: true, familyName: true } },
        band: { select: { id: true, name: true } },
      },
    });
  }

  async getBandChats(bandId: BandId): Promise<AllChatsView[]> {
    return this.prismaService.chat.findMany({
      where: {
        bandId: bandId.toPrimitive(),
      },
      include: {
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        user: { select: { id: true, firstName: true, familyName: true } },
        band: { select: { id: true, name: true } },
      },
    });
  }

  async deleteChat(id: ChatId): Promise<boolean> {
    try {
      await this.prismaService.chat.delete({
        where: { id: id.toPrimitive() },
      });
      return true;
    } catch {
      return false;
    }
  }
}
