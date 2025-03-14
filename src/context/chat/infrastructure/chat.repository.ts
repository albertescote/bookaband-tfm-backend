import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Chat from "../domain/chat";
import ChatId from "../domain/chatId";
import Message from "../domain/message";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { ChatView } from "../domain/chatView";

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

  async getChatViewById(id: ChatId): Promise<ChatView> {
    const chat = await this.prismaService.chat.findFirst({
      where: { id: id.toPrimitive() },
      select: {
        id: true,
        createdAt: true,
        messages: {
          orderBy: { timestamp: "asc" },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
        band: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    return chat ?? undefined;
  }

  async getUserChats(userId: UserId): Promise<ChatView[]> {
    return this.prismaService.chat.findMany({
      where: {
        userId: userId.toPrimitive(),
      },
      select: {
        id: true,
        createdAt: true,
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        user: {
          select: {
            id: true,
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
        band: { select: { id: true, name: true, imageUrl: true } },
      },
    });
  }

  async getBandChats(bandId: BandId): Promise<ChatView[]> {
    return this.prismaService.chat.findMany({
      where: {
        bandId: bandId.toPrimitive(),
      },
      select: {
        id: true,
        createdAt: true,
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        user: {
          select: {
            id: true,
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
        band: { select: { id: true, name: true, imageUrl: true } },
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
