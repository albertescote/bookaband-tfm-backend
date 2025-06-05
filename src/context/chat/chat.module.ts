import { Module } from "@nestjs/common";
import { ChatGateway } from "./infrastructure/chat.gateway";
import { ChatService } from "./service/chat.service";
import { ChatRepository } from "./infrastructure/chat.repository";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { CqrsModule } from "@nestjs/cqrs";
import { AddBookingIntoChatCommandHandler } from "./service/addBookingIntoChat.commandHandler";

@Module({
  imports: [CqrsModule],
  providers: [
    ChatGateway,
    ChatRepository,
    ChatService,
    PrismaService,
    AddBookingIntoChatCommandHandler,
  ],
  exports: [ChatService, AddBookingIntoChatCommandHandler],
})
export class ChatModule {}
