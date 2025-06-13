import { Test, TestingModule } from "@nestjs/testing";
import { ReadNotificationCommandHandler } from "../../../../src/context/notification/service/readNotification.commandHandler";
import { NotificationRepository } from "../../../../src/context/notification/infrastructure/notifications.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { ReadNotificationCommand } from "../../../../src/context/notification/service/readNotification.command";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { Notification } from "../../../../src/context/notification/domain/notificaiton";
import NotificationId from "../../../../src/context/notification/domain/notificationId";
import UserId from "../../../../src/context/shared/domain/userId";
import { NotificationNotFoundException } from "../../../../src/context/notification/exceptions/notificationNotFoundException";
import { BandNotFoundException } from "../../../../src/context/notification/exceptions/bandNotFoundException";
import { NotAMemberOfTheRequestedBandException } from "../../../../src/context/notification/exceptions/notAMemberOfTheRequestedBandException";

describe("ReadNotificationCommandHandler", () => {
  let handler: ReadNotificationCommandHandler;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const bandId = UserId.generate().toPrimitive();
  const userId = UserId.generate().toPrimitive();

  const mockUser: UserAuthInfo = {
    id: userId,
    email: "test@example.com",
    role: Role.Client,
  };

  const notificationId = NotificationId.generate().toPrimitive();

  const mockNotification = Notification.fromPrimitives({
    id: notificationId,
    bandId: bandId,
    userId: userId,
    isReadFromBand: false,
    isReadFromUser: false,
    createdAt: new Date().toISOString(),
  });

  beforeEach(async () => {
    notificationRepository = {
      getById: jest.fn(),
      update: jest.fn(),
    } as any;

    moduleConnectors = {
      obtainBandMembers: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadNotificationCommandHandler,
        {
          provide: NotificationRepository,
          useValue: notificationRepository,
        },
        {
          provide: ModuleConnectors,
          useValue: moduleConnectors,
        },
      ],
    }).compile();

    handler = module.get<ReadNotificationCommandHandler>(
      ReadNotificationCommandHandler,
    );
  });

  describe("execute", () => {
    it("should mark notification as read when user owns the notification", async () => {
      notificationRepository.getById.mockResolvedValue(mockNotification);

      const command = new ReadNotificationCommand(mockUser, notificationId);
      await handler.execute(command);

      expect(notificationRepository.getById).toHaveBeenCalledWith(
        new NotificationId(notificationId),
      );
      expect(notificationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          toPrimitives: expect.any(Function),
        }),
      );
      const updatedNotification =
        notificationRepository.update.mock.calls[0][0];
      expect(updatedNotification.toPrimitives().isReadFromUser).toBe(true);
    });

    it("should mark notification as read when user is a band member", async () => {
      const otherUser1 = UserId.generate().toPrimitive();
      const otherUser2 = UserId.generate().toPrimitive();
      const bandMemberNotification = Notification.fromPrimitives({
        ...mockNotification.toPrimitives(),
        userId: otherUser1,
      });
      notificationRepository.getById.mockResolvedValue(bandMemberNotification);
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        userId,
        otherUser2,
      ]);

      const command = new ReadNotificationCommand(mockUser, notificationId);
      await handler.execute(command);

      expect(notificationRepository.getById).toHaveBeenCalledWith(
        new NotificationId(notificationId),
      );
      expect(moduleConnectors.obtainBandMembers).toHaveBeenCalledWith(bandId);
      expect(notificationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          toPrimitives: expect.any(Function),
        }),
      );
      const updatedNotification =
        notificationRepository.update.mock.calls[0][0];
      expect(updatedNotification.toPrimitives().isReadFromBand).toBe(true);
    });

    it("should throw NotificationNotFoundException when notification is not found", async () => {
      notificationRepository.getById.mockResolvedValue(undefined);

      const nonExistentNotification = NotificationId.generate().toPrimitive();
      const command = new ReadNotificationCommand(
        mockUser,
        nonExistentNotification,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        NotificationNotFoundException,
      );
    });

    it("should throw BandNotFoundException when band is not found", async () => {
      const otherUser = UserId.generate().toPrimitive();
      const bandMemberNotification = Notification.fromPrimitives({
        ...mockNotification.toPrimitives(),
        userId: otherUser,
      });
      notificationRepository.getById.mockResolvedValue(bandMemberNotification);
      moduleConnectors.obtainBandMembers.mockResolvedValue(undefined);

      const command = new ReadNotificationCommand(mockUser, notificationId);
      await expect(handler.execute(command)).rejects.toThrow(
        BandNotFoundException,
      );
    });

    it("should throw NotAMemberOfTheRequestedBandException when user is not a band member", async () => {
      const otherUser = UserId.generate().toPrimitive();
      const bandMemberNotification = Notification.fromPrimitives({
        ...mockNotification.toPrimitives(),
        userId: otherUser,
      });
      notificationRepository.getById.mockResolvedValue(bandMemberNotification);
      moduleConnectors.obtainBandMembers.mockResolvedValue(["other-user-456"]);

      const command = new ReadNotificationCommand(mockUser, notificationId);
      await expect(handler.execute(command)).rejects.toThrow(
        NotAMemberOfTheRequestedBandException,
      );
    });
  });
});
