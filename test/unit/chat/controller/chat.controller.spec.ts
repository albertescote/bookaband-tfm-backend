import { Test, TestingModule } from "@nestjs/testing";
import { ChatController } from "../../../../src/app/api/chat/chat.controller";
import { ChatService } from "../../../../src/context/chat/service/chat.service";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { CreateChatRequestDto } from "../../../../src/app/api/chat/createChatRequest.dto";

describe("ChatController", () => {
  let controller: ChatController;

  const mockChatService = {
    createChat: jest.fn(),
    getChatHistory: jest.fn(),
    getClientChats: jest.fn(),
    getBandChats: jest.fn(),
  };

  const mockUser: UserAuthInfo = {
    id: "1",
    email: "test@example.com",
    role: Role.Client,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createChat", () => {
    it("should create a new chat", async () => {
      const createChatDto: CreateChatRequestDto = {
        bandId: "band-123",
      };

      const expectedResponse = {
        id: "chat-123",
        bandId: createChatDto.bandId,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockChatService.createChat.mockResolvedValue(expectedResponse);

      const result = await controller.createChat(createChatDto, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockChatService.createChat).toHaveBeenCalledWith(
        mockUser,
        createChatDto,
      );
    });
  });

  describe("getChatHistory", () => {
    it("should return chat history", async () => {
      const chatId = "chat-123";
      const expectedResponse = {
        id: chatId,
        messages: [
          {
            id: "msg-1",
            content: "Hello",
            senderId: mockUser.id,
            createdAt: new Date(),
          },
          {
            id: "msg-2",
            content: "Hi there!",
            senderId: "band-123",
            createdAt: new Date(),
          },
        ],
      };

      mockChatService.getChatHistory.mockResolvedValue(expectedResponse);

      const result = await controller.getChatHistory(chatId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockChatService.getChatHistory).toHaveBeenCalledWith(
        mockUser,
        chatId,
      );
    });
  });

  describe("getClientChats", () => {
    it("should return all chats for a client", async () => {
      const userId = "1";
      const expectedResponse = [
        {
          id: "chat-123",
          bandId: "band-123",
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: {
            content: "Hello",
            createdAt: new Date(),
          },
        },
      ];

      mockChatService.getClientChats.mockResolvedValue(expectedResponse);

      const result = await controller.getClientChats(userId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockChatService.getClientChats).toHaveBeenCalledWith(
        mockUser,
        userId,
      );
    });
  });

  describe("getBandChats", () => {
    it("should return all chats for a band", async () => {
      const bandId = "band-123";
      const expectedResponse = [
        {
          id: "chat-123",
          bandId: bandId,
          userId: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: {
            content: "Hello",
            createdAt: new Date(),
          },
        },
      ];

      mockChatService.getBandChats.mockResolvedValue(expectedResponse);

      const result = await controller.getBandChats(bandId, { user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockChatService.getBandChats).toHaveBeenCalledWith(
        mockUser,
        bandId,
      );
    });
  });
});
