import { Test, TestingModule } from "@nestjs/testing";
import { NotificationRepository } from "../../../../src/context/notification/infrastructure/notifications.repository";
import MongoCollectionService from "../../../../src/context/shared/infrastructure/db/mongoCollection.service";
import MongoService from "../../../../src/context/shared/infrastructure/db/mongo.service";
import { MongoClient } from "mongodb";
import { MONGO_DB_URL, MONGODB_COLLECTIONS } from "../../../../src/config";
import { Notification } from "../../../../src/context/notification/domain/notificaiton";
import NotificationId from "../../../../src/context/notification/domain/notificationId";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import { InvitationStatus } from "../../../../src/context/shared/domain/invitationStatus";

describe("NotificationRepository Integration Tests", () => {
  let repository: NotificationRepository;
  let mongoCollectionService: MongoCollectionService;
  let testNotification: Notification;
  let testUserId: string;
  let testBandId: string;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        MongoCollectionService,
        MongoService,
        {
          provide: MongoClient,
          useFactory: async () => {
            return new MongoClient(MONGO_DB_URL);
          },
        },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
    mongoCollectionService = module.get<MongoCollectionService>(
      MongoCollectionService,
    );
    testUserId = UserId.generate().toPrimitive();
    testBandId = BandId.generate().toPrimitive();
  });

  beforeEach(async () => {
    testNotification = Notification.createInvitationNotification(
      new BandId(testBandId),
      new UserId(testUserId),
      {
        userName: "Test User",
        bandName: "Test Band",
        status: InvitationStatus.PENDING,
        createdAt: new Date(),
      },
    );

    await repository.create(testNotification);
  });

  afterEach(async () => {
    await mongoCollectionService.deleteMany(MONGODB_COLLECTIONS.NOTIFICATIONS, {
      $or: [
        { id: testNotification.toPrimitives().id },
        { userId: testUserId },
        { bandId: testBandId },
      ],
    });
  });

  afterAll(async () => {
    const mongoService = module.get<MongoService>(MongoService);
    await mongoService.onModuleDestroy();
  });

  describe("getById", () => {
    it("should retrieve notification by id", async () => {
      const notification = await repository.getById(
        new NotificationId(testNotification.toPrimitives().id),
      );
      expect(notification).toBeDefined();
      expect(notification.toPrimitives()).toEqual(
        testNotification.toPrimitives(),
      );
    });

    it("should return undefined for non-existent notification id", async () => {
      const nonExistentId = NotificationId.generate();
      const notification = await repository.getById(nonExistentId);
      expect(notification).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("should retrieve all notifications", async () => {
      const notifications = await repository.getAll();
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toStrictEqual(1);
      expect(notifications[0].toPrimitives()).toEqual(
        testNotification.toPrimitives(),
      );
    });
  });

  describe("getAllFromUser", () => {
    it("should retrieve notifications for a specific user", async () => {
      const notifications = await repository.getAllFromUser(
        new UserId(testUserId),
      );
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].toPrimitives()).toEqual(
        testNotification.toPrimitives(),
      );
    });

    it("should return empty array for user with no notifications", async () => {
      const newUserId = UserId.generate();
      const notifications = await repository.getAllFromUser(newUserId);
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBe(0);
    });
  });

  describe("getAllFromBandId", () => {
    it("should retrieve notifications for a specific band", async () => {
      const notifications = await repository.getAllFromBandId(
        new BandId(testBandId),
      );
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].toPrimitives()).toEqual(
        testNotification.toPrimitives(),
      );
    });

    it("should return empty array for band with no notifications", async () => {
      const newBandId = BandId.generate();
      const notifications = await repository.getAllFromBandId(newBandId);
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBe(0);
    });
  });

  describe("update", () => {
    it("should successfully update a notification", async () => {
      const updatedNotification = Notification.fromPrimitives({
        ...testNotification.toPrimitives(),
        isReadFromUser: true,
      });

      const updated = await repository.update(updatedNotification);
      expect(updated).toBeDefined();
      expect(updated.toPrimitives()).toEqual(
        updatedNotification.toPrimitives(),
      );

      const retrieved = await repository.getById(
        new NotificationId(updatedNotification.toPrimitives().id),
      );
      expect(retrieved.toPrimitives()).toEqual(
        updatedNotification.toPrimitives(),
      );
    });
  });

  describe("delete", () => {
    it("should successfully delete a notification", async () => {
      await repository.delete(
        new NotificationId(testNotification.toPrimitives().id),
      );

      const deleted = await repository.getById(
        new NotificationId(testNotification.toPrimitives().id),
      );
      expect(deleted).toBeUndefined();
    });
  });
});
