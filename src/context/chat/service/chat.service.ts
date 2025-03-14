import { Injectable } from "@nestjs/common";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { NotOwnerOfTheRequestedChatException } from "../exceptions/notOwnerOfTheRequestedChatException";
import { ChatRepository } from "../infrastructure/chat.repository";
import ChatId from "../domain/chatId";
import { ChatPrimitives } from "../domain/chat";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { QueryBus } from "@nestjs/cqrs";
import { GetBandInfoQuery } from "../../band/service/getBandInfo.query";
import { MusicGenre } from "../../band/domain/musicGenre";

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
  ): Promise<ChatPrimitives> {
    const chat = await this.chatRepository.getChatHistoryById(
      new ChatId(chatId),
    );
    if (!chat.isOwner(authorized.id)) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    return chat.toPrimitives();
  }

  async getUserChats(authorized: UserAuthInfo, userId: string) {
    if (authorized.id !== userId) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    return await this.chatRepository.getUserChats(new UserId(userId));
  }

  async getBandChats(authorized: UserAuthInfo, bandId: string) {
    const userChats = await this.chatRepository.getBandChats(
      new BandId(bandId),
    );
    const bandInfo = (await this.queryBus.execute(
      new GetBandInfoQuery(bandId),
    )) as BandPrimitives;

    const memberId = bandInfo.membersId.find((memberId) => {
      return memberId === authorized.id;
    });
    if (!memberId) {
      throw new NotOwnerOfTheRequestedChatException();
    }
    return userChats;
  }
}
