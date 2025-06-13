import { Test, TestingModule } from "@nestjs/testing";
import { NotificationController } from "../../../../src/app/api/notification/notification.controller";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetAllNotificationsFromUserQuery } from "../../../../src/context/notification/service/getAllNotificationsFromUser.query";
import { ReadNotificationCommand } from "../../../../src/context/notification/service/readNotification.command";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { InvitationStatus } from "../../../../src/context/shared/domain/invitationStatus";

interface NotificationsResponse {
  id: string;
  bandId: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
  invitationMetadata?: {
    bandName: string;
    status: InvitationStatus;
    createdAt?: Date;
  };
  bookingMetadata?: {
    bookingId: string;
    status: string;
    eventName: string;
    userName: string;
    bandName: string;
  };
}

describe("NotificationController", () => {
  let controller: NotificationController;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllFromUser", () => {
    it("should return all notifications for a user", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const bandId = "band-123";

      const expectedResponse: NotificationsResponse[] = [
        {
          id: "1",
          bandId: "band-123",
          userId: "1",
          isRead: false,
          createdAt: new Date().toISOString(),
          invitationMetadata: {
            bandName: "Test Band",
            status: InvitationStatus.PENDING,
            createdAt: new Date(),
          },
        },
        {
          id: "2",
          bandId: "band-123",
          userId: "1",
          isRead: true,
          createdAt: new Date().toISOString(),
          bookingMetadata: {
            bookingId: "booking-123",
            status: "confirmed",
            eventName: "Test Event",
            userName: "Test User",
            bandName: "Test Band",
          },
        },
      ];

      mockQueryBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.getAllFromUser(
        { user: mockUser },
        bandId,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAllNotificationsFromUserQuery),
      );
      expect(mockQueryBus.execute.mock.calls[0][0]).toBeInstanceOf(
        GetAllNotificationsFromUserQuery,
      );
      expect(mockQueryBus.execute.mock.calls[0][0]).toStrictEqual(
        new GetAllNotificationsFromUserQuery(mockUser, bandId),
      );
    });
  });

  describe("readNotification", () => {
    it("should mark a notification as read", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const notificationId = "1";

      const expectedResponse: NotificationsResponse[] = [
        {
          id: "1",
          bandId: "band-123",
          userId: "1",
          isRead: true,
          createdAt: new Date().toISOString(),
          invitationMetadata: {
            bandName: "Test Band",
            status: InvitationStatus.PENDING,
            createdAt: new Date(),
          },
        },
      ];

      mockCommandBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.readNotification(
        { user: mockUser },
        notificationId,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(ReadNotificationCommand),
      );
      expect(mockCommandBus.execute.mock.calls[0][0]).toBeInstanceOf(
        ReadNotificationCommand,
      );
      expect(mockCommandBus.execute.mock.calls[0][0]).toStrictEqual(
        new ReadNotificationCommand(mockUser, notificationId),
      );
    });
  });
});
