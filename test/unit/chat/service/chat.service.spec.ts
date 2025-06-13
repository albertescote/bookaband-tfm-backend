import { Test, TestingModule } from "@nestjs/testing";
import {
  ChatService,
  CreateChatRequestDto,
} from "../../../../src/context/chat/service/chat.service";
import { ChatRepository } from "../../../../src/context/chat/infrastructure/chat.repository";
import { QueryBus } from "@nestjs/cqrs";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { NotOwnerOfTheRequestedChatException } from "../../../../src/context/chat/exceptions/notOwnerOfTheRequestedChatException";
import Chat from "../../../../src/context/chat/domain/chat";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import ChatId from "../../../../src/context/chat/domain/chatId";

describe("ChatService", () => {
  let service: ChatService;
  let chatRepository: jest.Mocked<ChatRepository>;
  let queryBus: jest.Mocked<QueryBus>;

  const mockUser: UserAuthInfo = {
    id: UserId.generate().toPrimitive(),
    email: "test@example.com",
    role: Role.Client,
  };

  const mockBandMember: UserAuthInfo = {
    id: UserId.generate().toPrimitive(),
    email: "musician@example.com",
    role: Role.Musician,
  };

  const bandId = BandId.generate().toPrimitive();
  const chatId = ChatId.generate().toPrimitive();

  const mockChat: Chat = {
    toPrimitives: jest.fn().mockReturnValue({
      id: chatId,
      userId: mockUser.id,
      bandId: bandId,
      messages: [],
    }),
    isOwner: jest.fn(),
    getId: jest.fn(),
  } as unknown as Chat;

  const mockChatHistory = {
    id: chatId,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
    user: {
      id: mockUser.id,
      firstName: "John",
      familyName: "Doe",
      imageUrl: "https://example.com/avatar.jpg",
    },
    band: {
      id: bandId,
      name: "Test Band",
      imageUrl: "https://example.com/band.jpg",
    },
  };

  const mockChatView = {
    ...mockChatHistory,
    unreadMessagesCount: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ChatRepository,
          useValue: {
            createChat: jest.fn(),
            getChatViewById: jest.fn(),
            getUserChats: jest.fn(),
            getBandChats: jest.fn(),
            markMessagesAsRead: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get(ChatRepository);
    queryBus = module.get(QueryBus);
  });

  describe("createChat", () => {
    it("should create a new chat", async () => {
      const request: CreateChatRequestDto = {
        bandId: bandId,
      };

      chatRepository.createChat.mockResolvedValue(mockChat);

      const result = await service.createChat(mockUser, request);

      expect(result).toEqual(mockChat.toPrimitives());
      expect(chatRepository.createChat).toHaveBeenCalledWith(expect.any(Chat));
    });
  });

  describe("getChatHistory", () => {
    it("should return chat history for a user", async () => {
      chatRepository.getChatViewById.mockResolvedValue(mockChatHistory);
      (mockChat.isOwner as jest.Mock).mockReturnValue(true);

      const result = await service.getChatHistory(mockUser, chatId);

      expect(result).toEqual(mockChatHistory);
      expect(chatRepository.markMessagesAsRead).toHaveBeenCalledWith(
        chatId,
        mockUser.id,
      );
    });

    it("should return chat history for a band member", async () => {
      chatRepository.getChatViewById.mockResolvedValue(mockChatHistory);
      (mockChat.isOwner as jest.Mock).mockReturnValue(false);
      queryBus.execute.mockResolvedValue({
        members: [{ id: mockBandMember.id }],
      });

      const result = await service.getChatHistory(mockBandMember, chatId);

      expect(result).toEqual(mockChatHistory);
      expect(chatRepository.markMessagesAsRead).toHaveBeenCalledWith(
        chatId,
        mockChatHistory.band.id,
      );
    });

    it("should throw NotOwnerOfTheRequestedChatException if user is not authorized", async () => {
      chatRepository.getChatViewById.mockResolvedValue(mockChatHistory);
      (mockChat.isOwner as jest.Mock).mockReturnValue(false);
      queryBus.execute.mockResolvedValue({
        members: [],
      });

      await expect(
        service.getChatHistory(mockBandMember, chatId),
      ).rejects.toThrow(NotOwnerOfTheRequestedChatException);
    });
  });

  describe("getClientChats", () => {
    it("should return all chats for a client", async () => {
      const userId = mockUser.id;
      chatRepository.getUserChats.mockResolvedValue([mockChatView]);

      const result = await service.getClientChats(mockUser, userId);

      expect(result).toEqual([mockChatView]);
      expect(chatRepository.getUserChats).toHaveBeenCalledWith(
        expect.any(UserId),
      );
    });

    it("should throw NotOwnerOfTheRequestedChatException if user is not the owner", async () => {
      const otherUser = UserId.generate().toPrimitive();

      await expect(service.getClientChats(mockUser, otherUser)).rejects.toThrow(
        NotOwnerOfTheRequestedChatException,
      );
    });
  });

  describe("getBandChats", () => {
    it("should return all chats for a band member", async () => {
      chatRepository.getBandChats.mockResolvedValue([mockChatView]);
      queryBus.execute.mockResolvedValue({
        members: [{ id: mockBandMember.id }],
      });

      const result = await service.getBandChats(mockBandMember, bandId);

      expect(result).toEqual([mockChatView]);
      expect(chatRepository.getBandChats).toHaveBeenCalledWith(
        expect.any(BandId),
      );
    });

    it("should throw NotOwnerOfTheRequestedChatException if user is not a band member", async () => {
      chatRepository.getBandChats.mockResolvedValue([mockChatView]);
      queryBus.execute.mockResolvedValue({
        members: [],
      });

      await expect(
        service.getBandChats(mockBandMember, bandId),
      ).rejects.toThrow(NotOwnerOfTheRequestedChatException);
    });
  });
});
