import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import Message from "../domain/message";
import MessageId from "../domain/messageId";
import { ChatRepository } from "./chat.repository";
import ChatId from "../domain/chatId";
import {
  FRONTEND_APP_URL,
  FRONTEND_AUTH_URL,
  FRONTEND_PAGE_URL,
} from "../../../config";
import { InvalidMessageActorsException } from "../exceptions/invalidMessageActorsException";
import { ChatIdNotFoundException } from "../exceptions/chatIdNotFoundException";

interface MessageRequest {
  chatId: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: string | Date;
}

const allowedOrigins = [FRONTEND_AUTH_URL, FRONTEND_PAGE_URL, FRONTEND_APP_URL];

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>();

  constructor(private chatRepository: ChatRepository) {}

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage("join")
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    this.users.set(userId, client.id);
  }

  @SubscribeMessage("message")
  async handleMessage(
    @MessageBody()
    data: MessageRequest,
    @ConnectedSocket() client: Socket,
  ) {
    const recipientSocketId = this.users.get(data.recipientId);

    const chat = await this.chatRepository.getChatById(new ChatId(data.chatId));
    if (!chat) {
      throw new ChatIdNotFoundException(data.chatId);
    }
    if (!chat.isOwner(data.senderId) || !chat.isOwner(data.recipientId)) {
      throw new InvalidMessageActorsException();
    }

    let isRead = false;

    if (recipientSocketId) {
      isRead = true;
      this.server.to(recipientSocketId).emit("message", data);
    }

    await this.chatRepository.addMessage(
      new ChatId(data.chatId),
      Message.createNewTextMessage({
        id: MessageId.generate().toPrimitive(),
        senderId: data.senderId,
        recipientId: data.recipientId,
        message: data.message,
      }),
      isRead,
    );
  }
}
