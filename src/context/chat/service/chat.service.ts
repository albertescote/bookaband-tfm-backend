import { Injectable } from "@nestjs/common";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { NotOwnerOfTheRequestedChatException } from "../exceptions/notOwnerOfTheRequestedChatException";
import { ChatRepository } from "../infrastructure/chat.repository";
import ChatId from "../domain/chatId";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { QueryBus } from "@nestjs/cqrs";
import { GetBandInfoQuery } from "../../band/service/getBandInfo.query";
import { MusicGenre } from "../../band/domain/musicGenre";
import { ChatView } from "../domain/chatView";
import Chat from "../domain/chat";

interface BandPrimitives {
  id: string;
  name: string;
  membersId: string[];
  genre: MusicGenre;
  imageUrl?: string;
}

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private queryBus: QueryBus,
  ) {}

  async getChatHistory(
    authorized: UserAuthInfo,
    chatId: string,
  ): Promise<ChatView> {
    const chatView = await this.chatRepository.getChatViewById(
      new ChatId(chatId),
    );
    const isBandMember = await this.checkIfBandMember(
      authorized,
      chatView.band.id,
    );
    const chat = Chat.fromPrimitives({
      id: chatView.id,
      userId: chatView.user.id,
      bandId: chatView.band.id,
      messages: chatView.messages,
    });
    if (!chat.isOwner(authorized.id) && !isBandMember) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    return chatView;
  }

  async getUserChats(
    authorized: UserAuthInfo,
    userId: string,
  ): Promise<ChatView[]> {
    if (authorized.id !== userId) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    return await this.chatRepository.getUserChats(new UserId(userId));
  }

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
    authorized: UserAuthInfo,
    bandId: string,
  ): Promise<boolean> {
    const bandInfo = (await this.queryBus.execute(
      new GetBandInfoQuery(bandId),
    )) as BandPrimitives;

    const memberId = bandInfo.membersId.find((memberId) => {
      return memberId === authorized.id;
    });
    return !!memberId;
  }
}
