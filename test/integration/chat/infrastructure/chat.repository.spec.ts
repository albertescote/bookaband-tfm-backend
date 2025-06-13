import { Test, TestingModule } from "@nestjs/testing";
import { ChatRepository } from "../../../../src/context/chat/infrastructure/chat.repository";
import Chat from "../../../../src/context/chat/domain/chat";
import ChatId from "../../../../src/context/chat/domain/chatId";
import Message from "../../../../src/context/chat/domain/message";
import MessageId from "../../../../src/context/chat/domain/messageId";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { v4 as uuidv4 } from "uuid";
import { BandSize } from "../../../../src/context/band/domain/bandSize";

describe("ChatRepository Integration Tests", () => {
  let repository: ChatRepository;
  let prismaService: PrismaService;
  let testChat: Chat;
  let testChatId: string;
  let testUserId: string;
  let testBandId: string;
  let testMessageId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatRepository, PrismaService],
    }).compile();

    repository = module.get<ChatRepository>(ChatRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    const testUser = await prismaService.user.create({
      data: {
        id: uuidv4(),
        firstName: "Test",
        familyName: "User",
        email: "test@example.com",
        role: "CLIENT",
        phoneNumber: "123456789",
        joinedDate: new Date(),
      },
    });
    testUserId = testUser.id;

    const technicalRiderId = uuidv4();
    const hospitalityRiderId = uuidv4();
    const performanceAreaId = uuidv4();

    await prismaService.technicalRider.create({
      data: {
        id: technicalRiderId,
        soundSystem: "Test Sound System",
        microphones: "Test Microphones",
        backline: "Test Backline",
        lighting: "Test Lighting",
      },
    });

    await prismaService.hospitalityRider.create({
      data: {
        id: hospitalityRiderId,
        accommodation: "Test Accommodation",
        catering: "Test Catering",
        beverages: "Test Beverages",
      },
    });

    await prismaService.performanceArea.create({
      data: {
        id: performanceAreaId,
        regions: ["Test Region"],
        travelPreferences: "Test Travel Preferences",
      },
    });

    const testBand = await prismaService.band.create({
      data: {
        id: BandId.generate().toPrimitive(),
        name: "Test Band",
        musicalStyleIds: [],
        followers: 0,
        following: 0,
        createdAt: new Date(),
        price: 1000,
        location: "Test Location",
        bandSize: BandSize.BAND,
        eventTypeIds: [],
        featured: false,
        visible: true,
        weeklyAvailability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        },
        technicalRiderId: technicalRiderId,
        hospitalityRiderId: hospitalityRiderId,
        performanceAreaId: performanceAreaId,
      },
    });
    testBandId = testBand.id;

    testChat = new Chat(
      ChatId.generate(),
      new UserId(testUserId),
      new BandId(testBandId),
    );
    testChatId = testChat.getId().toPrimitive();
    testMessageId = MessageId.generate().toPrimitive();
  });

  afterAll(async () => {
    await prismaService.message.deleteMany();
    await prismaService.chat.deleteMany();
    await prismaService.band.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.technicalRider.deleteMany();
    await prismaService.hospitalityRider.deleteMany();
    await prismaService.performanceArea.deleteMany();
    await prismaService.$disconnect();
  });

  describe("createChat", () => {
    it("should create a new chat", async () => {
      const createdChat = await repository.createChat(testChat);

      expect(createdChat).toBeDefined();
      expect(createdChat.getId().toPrimitive()).toBe(testChatId);
      expect(createdChat.toPrimitives().userId).toBe(testUserId);
      expect(createdChat.toPrimitives().bandId).toBe(testBandId);
      expect(createdChat.toPrimitives().messages).toHaveLength(0);
    });
  });

  describe("addMessage", () => {
    it("should add a message to an existing chat", async () => {
      const message = Message.createNewTextMessage({
        id: testMessageId,
        senderId: testUserId,
        recipientId: testBandId,
        message: "Test message",
      });

      await repository.addMessage(new ChatId(testChatId), message, false);

      const chat = await repository.getChatById(new ChatId(testChatId));
      expect(chat).toBeDefined();
      expect(chat.toPrimitives().messages).toHaveLength(1);
      expect(chat.toPrimitives().messages[0].id).toBe(testMessageId);
      expect(chat.toPrimitives().messages[0].message).toBe("Test message");
    });
  });

  describe("markMessagesAsRead", () => {
    it("should mark messages as read for a recipient", async () => {
      await repository.markMessagesAsRead(testChatId, testBandId);

      const message = await prismaService.message.findFirst({
        where: { chatId: testChatId },
      });
      expect(message).toBeDefined();
      expect(message.isRead).toBe(true);
    });
  });

  describe("getChatById", () => {
    it("should return undefined when chat does not exist", async () => {
      const nonExistentId = ChatId.generate();
      const foundChat = await repository.getChatById(nonExistentId);

      expect(foundChat).toBeUndefined();
    });

    it("should return the chat when it exists", async () => {
      const foundChat = await repository.getChatById(new ChatId(testChatId));

      expect(foundChat).toBeDefined();
      expect(foundChat.getId().toPrimitive()).toBe(testChatId);
      expect(foundChat.toPrimitives().userId).toBe(testUserId);
      expect(foundChat.toPrimitives().bandId).toBe(testBandId);
    });
  });

  describe("getChatByUserIdAndBandId", () => {
    it("should return undefined when chat does not exist for user and band", async () => {
      const nonExistentUserId = UserId.generate();
      const nonExistentBandId = BandId.generate();
      const foundChat = await repository.getChatByUserIdAndBandId(
        nonExistentUserId,
        nonExistentBandId,
      );

      expect(foundChat).toBeUndefined();
    });

    it("should return the chat when it exists for user and band", async () => {
      const foundChat = await repository.getChatByUserIdAndBandId(
        new UserId(testUserId),
        new BandId(testBandId),
      );

      expect(foundChat).toBeDefined();
      expect(foundChat.getId().toPrimitive()).toBe(testChatId);
      expect(foundChat.toPrimitives().userId).toBe(testUserId);
      expect(foundChat.toPrimitives().bandId).toBe(testBandId);
    });
  });

  describe("getChatViewById", () => {
    it("should return undefined when chat does not exist", async () => {
      const nonExistentId = ChatId.generate();
      const foundChat = await repository.getChatViewById(nonExistentId);

      expect(foundChat).toBeUndefined();
    });

    it("should return the chat view when it exists", async () => {
      const foundChat = await repository.getChatViewById(
        new ChatId(testChatId),
      );

      expect(foundChat).toBeDefined();
      expect(foundChat.id).toBe(testChatId);
      expect(foundChat.user.id).toBe(testUserId);
      expect(foundChat.band.id).toBe(testBandId);
      expect(foundChat.messages).toHaveLength(1);
    });
  });

  describe("getUserChats", () => {
    it("should return chats for user", async () => {
      const chats = await repository.getUserChats(new UserId(testUserId));

      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
      expect(chats[0].id).toBe(testChatId);
      expect(chats[0].user.id).toBe(testUserId);
      expect(chats[0].band.id).toBe(testBandId);
    });
  });

  describe("getBandChats", () => {
    it("should return chats for band", async () => {
      const chats = await repository.getBandChats(new BandId(testBandId));

      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
      expect(chats[0].id).toBe(testChatId);
      expect(chats[0].user.id).toBe(testUserId);
      expect(chats[0].band.id).toBe(testBandId);
    });
  });

  describe("deleteChat", () => {
    it("should delete an existing chat", async () => {
      const chatToDelete = new Chat(
        ChatId.generate(),
        new UserId(testUserId),
        new BandId(testBandId),
      );
      const chatToDeleteId = chatToDelete.getId().toPrimitive();
      await repository.createChat(chatToDelete);

      const result = await repository.deleteChat(new ChatId(chatToDeleteId));
      expect(result).toBe(true);

      const foundChat = await repository.getChatById(
        new ChatId(chatToDeleteId),
      );
      expect(foundChat).toBeUndefined();
    });

    it("should return false when trying to delete a non-existent chat", async () => {
      const nonExistentId = ChatId.generate();
      const result = await repository.deleteChat(nonExistentId);
      expect(result).toBe(false);
    });
  });
});
