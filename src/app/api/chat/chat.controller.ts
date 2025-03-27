import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ChatService } from "../../../context/chat/service/chat.service";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { CreateChatRequestDto } from "./createChatRequest.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async createChat(
    @Body() body: CreateChatRequestDto,
    @Request() req: { user: UserAuthInfo },
  ) {
    return this.chatService.createChat(req.user, body);
  }

  @Get("/:id/history")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getChatHistory(
    @Param("id", ParseUUIDPipe) chatId: string,
    @Request() req: { user: UserAuthInfo },
  ) {
    return this.chatService.getChatHistory(req.user, chatId);
  }

  @Get("/client/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getClientChats(
    @Param("id", ParseUUIDPipe) userId: string,
    @Request() req: { user: UserAuthInfo },
  ) {
    return this.chatService.getClientChats(req.user, userId);
  }

  @Get("/band/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getBandChats(
    @Param("id", ParseUUIDPipe) bandId: string,
    @Request() req: { user: UserAuthInfo },
  ) {
    return this.chatService.getBandChats(req.user, bandId);
  }
}
