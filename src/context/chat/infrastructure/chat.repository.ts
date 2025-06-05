import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Chat from "../domain/chat";
import ChatId from "../domain/chatId";
import Message from "../domain/message";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { ChatView } from "../domain/chatView";
import { ChatHistory } from "../domain/chatHistory";
import BookingId from "../../shared/domain/bookingId";
import { BookingStatus } from "../../shared/domain/bookingStatus";

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

  async addMessage(
    chatId: ChatId,
    message: Message,
    isRead: boolean,
    bookingId?: BookingId,
  ) {
    const messagePrimitives = message.toPrimitives();
    await this.prismaService.$transaction([
      this.prismaService.message.create({
        data: {
          id: messagePrimitives.id,
          chatId: chatId.toPrimitive(),
          senderId: messagePrimitives.senderId,
          recipientId: messagePrimitives.recipientId,
          message: messagePrimitives.message,
          bookingId: bookingId.toPrimitive(),
          isRead,
        },
      }),
      this.prismaService.chat.update({
        where: { id: chatId.toPrimitive() },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);
  }

  async markMessagesAsRead(chatId: string, recipientId: string) {
    await this.prismaService.message.updateMany({
      where: {
        chatId,
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getChatById(id: ChatId): Promise<Chat> {
    const chat = await this.prismaService.chat.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        messages: {
          include: {
            booking: true,
          },
        },
      },
    });

    return chat
      ? Chat.fromPrimitives({
          id: chat.id,
          userId: chat.userId,
          bandId: chat.bandId,
          messages: chat.messages.map((message) => {
            return {
              id: message.id,
              senderId: message.senderId,
              recipientId: message.recipientId,
              message: message.message,
              ...(message.booking && {
                metadata: {
                  bookingId: message.booking.id,
                  bookingStatus: message.booking.status as BookingStatus,
                  eventName: message.booking.name,
                  eventDate: message.booking.initDate,
                  venue: message.booking.venue,
                  city: message.booking.city,
                },
              }),
              timestamp: message.timestamp,
            };
          }),
        })
      : undefined;
  }

  async getChatByUserIdAndBandId(
    userId: UserId,
    bandId: BandId,
  ): Promise<Chat> {
    const chat = await this.prismaService.chat.findFirst({
      where: { userId: userId.toPrimitive(), bandId: bandId.toPrimitive() },
      include: {
        messages: {
          include: {
            booking: true,
          },
        },
      },
    });

    return chat
      ? Chat.fromPrimitives({
          id: chat.id,
          userId: chat.userId,
          bandId: chat.bandId,
          messages: chat.messages.map((message) => {
            return {
              id: message.id,
              senderId: message.senderId,
              recipientId: message.recipientId,
              message: message.message,
              ...(message.booking && {
                metadata: {
                  bookingId: message.booking.id,
                  bookingStatus: message.booking.status as BookingStatus,
                  eventName: message.booking.name,
                  eventDate: message.booking.initDate,
                  venue: message.booking.venue,
                  city: message.booking.city,
                },
              }),
              timestamp: message.timestamp,
            };
          }),
        })
      : undefined;
  }

  async getChatViewById(id: ChatId): Promise<ChatHistory> {
    const chat = await this.prismaService.chat.findFirst({
      where: { id: id.toPrimitive() },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          include: {
            booking: true,
          },
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

    return chat
      ? {
          ...chat,
          messages: chat.messages.map((message) => {
            return {
              id: message.id,
              senderId: message.senderId,
              recipientId: message.recipientId,
              message: message.message,
              ...(message.booking && {
                metadata: {
                  bookingId: message.booking.id,
                  bookingStatus: message.booking.status as BookingStatus,
                  eventName: message.booking.name,
                  eventDate: message.booking.initDate,
                  venue: message.booking.venue,
                  city: message.booking.city,
                },
              }),
              timestamp: message.timestamp,
            };
          }),
        }
      : undefined;
  }

  async getUserChats(userId: UserId): Promise<ChatView[]> {
    const chats = await this.prismaService.chat.findMany({
      where: {
        userId: userId.toPrimitive(),
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
          select: {
            id: true,
            senderId: true,
            recipientId: true,
            message: true,
            timestamp: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
        band: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                recipientId: userId.toPrimitive(),
              },
            },
          },
        },
      },
    });

    return chats.map((chat) => ({
      id: chat.id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages,
      user: chat.user,
      band: chat.band,
      unreadMessagesCount: chat._count.messages,
    }));
  }

  async getBandChats(bandId: BandId): Promise<ChatView[]> {
    const chats = await this.prismaService.chat.findMany({
      where: {
        bandId: bandId.toPrimitive(),
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          include: {
            booking: true,
          },
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
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                recipientId: bandId.toPrimitive(),
              },
            },
          },
        },
      },
    });
    return chats.map((chat) => ({
      id: chat.id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map((message) => {
        return {
          id: message.id,
          senderId: message.senderId,
          recipientId: message.recipientId,
          message: message.message,
          ...(message.booking && {
            metadata: {
              bookingId: message.booking.id,
              bookingStatus: message.booking.status as BookingStatus,
              eventName: message.booking.name,
              eventDate: message.booking.initDate,
              venue: message.booking.venue,
              city: message.booking.city,
            },
          }),
          timestamp: message.timestamp,
        };
      }),
      user: chat.user,
      band: chat.band,
      unreadMessagesCount: chat._count.messages,
    }));
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
