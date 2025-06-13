import { Injectable } from "@nestjs/common";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { NotOwnerOfTheRequestedChatException } from "../exceptions/notOwnerOfTheRequestedChatException";
import { ChatRepository } from "../infrastructure/chat.repository";
import ChatId from "../domain/chatId";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { QueryBus } from "@nestjs/cqrs";
import { GetBandInfoQuery } from "../../band/service/getBandInfo.query";
import { ChatView } from "../domain/chatView";
import Chat from "../domain/chat";
import { MessagePrimitives } from "../domain/message";
import { ChatHistory } from "../domain/chatHistory";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { BandRole } from "../../band/domain/bandRole";

export interface CreateChatRequestDto {
  bandId: string;
}

export interface CreateChatResponseDto {
  id: string;
  userId: string;
  bandId: string;
  messages: MessagePrimitives[];
}

interface BandPrimitives {
  id: string;
  name: string;
  members: { id: string; role: BandRole }[];
}

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private queryBus: QueryBus,
  ) {}

  @RoleAuth([Role.Client])
  async createChat(
    userAuthInfo: UserAuthInfo,
    request: CreateChatRequestDto,
  ): Promise<CreateChatResponseDto> {
    const newChat = new Chat(
      ChatId.generate(),
      new UserId(userAuthInfo.id),
      new BandId(request.bandId),
    );
    const createdChat = await this.chatRepository.createChat(newChat);
    return createdChat.toPrimitives();
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
  async getChatHistory(
    authorized: UserAuthInfo,
    chatId: string,
  ): Promise<ChatHistory> {
    const chatHistory = await this.chatRepository.getChatViewById(
      new ChatId(chatId),
    );
    const isBandMember =
      authorized.role === Role.Musician
        ? await this.checkIfBandMember(authorized, chatHistory.band.id)
        : false;
    const chat = Chat.fromPrimitives({
      id: chatHistory.id,
      userId: chatHistory.user.id,
      bandId: chatHistory.band.id,
      messages: chatHistory.messages,
    });
    if (!chat.isOwner(authorized.id) && !isBandMember) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    let recipientId = authorized.id;
    if (isBandMember) {
      recipientId = chatHistory.band.id;
    }
    await this.chatRepository.markMessagesAsRead(chatId, recipientId);
    return chatHistory;
  }

  @RoleAuth([Role.Client])
  async getClientChats(
    userAuthInfo: UserAuthInfo,
    userId: string,
  ): Promise<ChatView[]> {
    if (userAuthInfo.id !== userId) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    return await this.chatRepository.getUserChats(new UserId(userId));
  }

  @RoleAuth([Role.Musician])
  async getBandChats(
    authorized: UserAuthInfo,
    bandId: string,
  ): Promise<ChatView[]> {
    const userChats = await this.chatRepository.getBandChats(
      new BandId(bandId),
    );
    const isBandMember = await this.checkIfBandMember(authorized, bandId);
    if (!isBandMember) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    return userChats;
  }

  private async checkIfBandMember(
    userAuthInfo: UserAuthInfo,
    bandId: string,
  ): Promise<boolean> {
    const bandInfo = (await this.queryBus.execute(
      new GetBandInfoQuery(bandId),
    )) as BandPrimitives;

    const memberId = bandInfo.members.find((member) => {
      return member.id === userAuthInfo.id;
    });
    return !!memberId;
  }
}
