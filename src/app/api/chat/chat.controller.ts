import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ChatService } from "../../../context/chat/service/chat.service";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("/:id/history")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getChatHistory(
    @Param("id", ParseUUIDPipe) chatId: string,
    @Request() req: { user: UserAuthInfo },
  ) {
    return this.chatService.getChatHistory(req.user, chatId);
  }

  @Get("/user/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getUserChats(
    @Param("id", ParseUUIDPipe) userId: string,
    @Request() req: { user: UserAuthInfo },
  ) {
    return this.chatService.getUserChats(req.user, userId);
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
