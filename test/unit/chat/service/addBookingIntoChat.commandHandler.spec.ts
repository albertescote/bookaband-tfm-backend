import { Test, TestingModule } from "@nestjs/testing";
import { AddBookingIntoChatCommandHandler } from "../../../../src/context/chat/service/addBookingIntoChat.commandHandler";
import { AddBookingIntoChatCommand } from "../../../../src/context/chat/service/addBookingIntoChat.command";
import { ChatRepository } from "../../../../src/context/chat/infrastructure/chat.repository";
import { UnableToCreateChatException } from "../../../../src/context/chat/exceptions/unableToCreateChatException";
import Chat from "../../../../src/context/chat/domain/chat";
import ChatId from "../../../../src/context/chat/domain/chatId";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import Message from "../../../../src/context/chat/domain/message";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("AddBookingIntoChatCommandHandler", () => {
  let handler: AddBookingIntoChatCommandHandler;
  let chatRepository: jest.Mocked<ChatRepository>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockBookingId = BookingId.generate().toPrimitive();

  const mockChat: Chat = {
    getId: jest.fn().mockReturnValue(ChatId.generate()),
  } as unknown as Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddBookingIntoChatCommandHandler,
        {
          provide: ChatRepository,
          useValue: {
            getChatByUserIdAndBandId: jest.fn(),
            addMessage: jest.fn(),
            createChat: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<AddBookingIntoChatCommandHandler>(
      AddBookingIntoChatCommandHandler,
    );
    chatRepository = module.get(ChatRepository);
  });

  describe("execute", () => {
    it("should add booking message to existing chat", async () => {
      const command = new AddBookingIntoChatCommand(
        mockUserId,
        mockBandId,
        mockBookingId,
      );
      chatRepository.getChatByUserIdAndBandId.mockResolvedValue(mockChat);

      await handler.execute(command);

      expect(chatRepository.getChatByUserIdAndBandId).toHaveBeenCalledWith(
        expect.any(UserId),
        expect.any(BandId),
      );
      expect(chatRepository.addMessage).toHaveBeenCalledWith(
        expect.any(ChatId),
        expect.any(Message),
        false,
      );
      expect(chatRepository.createChat).not.toHaveBeenCalled();
    });

    it("should create new chat with booking message when chat doesn't exist", async () => {
      const command = new AddBookingIntoChatCommand(
        mockUserId,
        mockBandId,
        mockBookingId,
      );
      chatRepository.getChatByUserIdAndBandId.mockResolvedValue(undefined);
      chatRepository.createChat.mockResolvedValue(mockChat);

      await handler.execute(command);

      expect(chatRepository.getChatByUserIdAndBandId).toHaveBeenCalledWith(
        expect.any(UserId),
        expect.any(BandId),
      );
      expect(chatRepository.createChat).toHaveBeenCalledWith(expect.any(Chat));
      expect(chatRepository.addMessage).not.toHaveBeenCalled();
    });

    it("should throw UnableToCreateChatException when chat creation fails", async () => {
      const command = new AddBookingIntoChatCommand(
        mockUserId,
        mockBandId,
        mockBookingId,
      );
      chatRepository.getChatByUserIdAndBandId.mockResolvedValue(undefined);
      chatRepository.createChat.mockResolvedValue(undefined);

      await expect(handler.execute(command)).rejects.toThrow(
        UnableToCreateChatException,
      );
      expect(chatRepository.getChatByUserIdAndBandId).toHaveBeenCalledWith(
        expect.any(UserId),
        expect.any(BandId),
      );
      expect(chatRepository.createChat).toHaveBeenCalledWith(expect.any(Chat));
      expect(chatRepository.addMessage).not.toHaveBeenCalled();
    });
  });
});
