import { Module } from "@nestjs/common";
import { ChatGateway } from "./infrastructure/chat.gateway";
import { ChatService } from "./service/chat.service";
import { ChatRepository } from "./infrastructure/chat.repository";

@Module({
  providers: [ChatGateway, ChatRepository, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
