import { Test, TestingModule } from "@nestjs/testing";
import { GetAllNotificationsFromUserQueryHandler } from "../../../../src/context/notification/service/getAllNotificationsFromUser.queryHandler";
import { GetAllNotificationsFromUserQuery } from "../../../../src/context/notification/service/getAllNotificationsFromUser.query";
import { NotificationRepository } from "../../../../src/context/notification/infrastructure/notifications.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { Notification } from "../../../../src/context/notification/domain/notificaiton";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import { Role } from "../../../../src/context/shared/domain/role";
import User from "../../../../src/context/shared/domain/user";
import { BandPrimitives } from "../../../../src/context/band/domain/band";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { InvitationStatus } from "../../../../src/context/shared/domain/invitationStatus";
import { BandNotFoundException } from "../../../../src/context/notification/exceptions/bandNotFoundException";

describe("GetAllNotificationsFromUserQueryHandler", () => {
  let handler: GetAllNotificationsFromUserQueryHandler;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const userId = UserId.generate().toPrimitive();
  const bandId = BandId.generate().toPrimitive();

  beforeEach(async () => {
    notificationRepository = {
      getAllFromUser: jest.fn(),
    } as any;

    moduleConnectors = {
      obtainUserInformation: jest.fn(),
      getBandById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllNotificationsFromUserQueryHandler,
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

    handler = module.get<GetAllNotificationsFromUserQueryHandler>(
      GetAllNotificationsFromUserQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return all notifications for a user", async () => {
      const mockUser = new User(
        new UserId(userId),
        "Test",
        "User",
        "test@example.com",
        Role.Client,
        true,
        new Date(),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      const mockBand: BandPrimitives = {
        id: bandId,
        name: "Test Band",
        members: [],
        musicalStyleIds: [],
        eventTypeIds: [],
        reviewCount: 0,
        followers: 0,
        following: 0,
        price: 0,
        location: "",
        bandSize: BandSize.BAND,
        imageUrl: "",
        createdAt: new Date(),
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
        rating: 0,
        hospitalityRider: {
          accommodation: "Standard accommodation",
          catering: "Standard catering",
          beverages: "Standard beverages",
          specialRequirements: "No special requirements",
        },
        technicalRider: {
          soundSystem: "Standard sound system",
          microphones: "Standard microphones",
          backline: "Standard backline",
          lighting: "Standard lighting",
          otherRequirements: "No other requirements",
        },
        performanceArea: {
          regions: ["Catalonia", "Valencia", "Balearic Islands"],
          gasPriceCalculation: {
            fuelConsumption: 12.5,
            useDynamicPricing: true,
            pricePerLiter: 1.85,
          },
          otherComments: "No outdoor events during winter",
        },
        media: [],
        socialLinks: [],
      };

      const mockNotifications = [
        Notification.fromPrimitives({
          id: "0df12544-b40b-485c-b7d2-8052812288c7",
          bandId: bandId,
          userId: userId,
          isReadFromBand: false,
          isReadFromUser: false,
          createdAt: new Date("2024-03-21T10:00:00.000Z").toISOString(),
          invitationMetadata: {
            bandName: "Test Band",
            status: InvitationStatus.PENDING,
            createdAt: new Date("2024-03-21T10:00:00.000Z"),
            userName: "Test User",
          },
        }),
        Notification.fromPrimitives({
          id: "095a133d-5449-4974-bcf4-b6c097b89852",
          bandId: bandId,
          userId: userId,
          isReadFromBand: false,
          isReadFromUser: false,
          createdAt: new Date("2024-03-20T10:00:00.000Z").toISOString(),
          invitationMetadata: {
            bandName: "Test Band",
            status: InvitationStatus.PENDING,
            createdAt: new Date("2024-03-20T10:00:00.000Z"),
            userName: "Test User",
          },
        }),
      ];

      moduleConnectors.obtainUserInformation.mockResolvedValue(mockUser);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      notificationRepository.getAllFromUser.mockResolvedValue(
        mockNotifications,
      );

      const query = new GetAllNotificationsFromUserQuery(
        { id: userId, email: "test@example.com", role: Role.Client },
        bandId,
      );
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("0df12544-b40b-485c-b7d2-8052812288c7");
      expect(result[1].id).toBe("095a133d-5449-4974-bcf4-b6c097b89852");
    });

    it("should throw BandNotFoundException when band does not exist", async () => {
      moduleConnectors.getBandById.mockResolvedValue(undefined);

      const query = new GetAllNotificationsFromUserQuery(
        { id: userId, email: "test@example.com", role: Role.Musician },
        bandId,
      );
      await expect(handler.execute(query)).rejects.toThrow(
        new BandNotFoundException(bandId),
      );
    });

    it("should deduplicate notifications with the same ID", async () => {
      const mockUser = new User(
        new UserId(userId),
        "Test",
        "User",
        "test@example.com",
        Role.Client,
        true,
        new Date(),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      const mockBand: BandPrimitives = {
        id: bandId,
        name: "Test Band",
        members: [],
        musicalStyleIds: [],
        eventTypeIds: [],
        reviewCount: 0,
        followers: 0,
        following: 0,
        price: 0,
        location: "",
        bandSize: BandSize.BAND,
        imageUrl: "",
        createdAt: new Date(),
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
        rating: 0,
        hospitalityRider: {
          accommodation: "Standard accommodation",
          catering: "Standard catering",
          beverages: "Standard beverages",
          specialRequirements: "No special requirements",
        },
        technicalRider: {
          soundSystem: "Standard sound system",
          microphones: "Standard microphones",
          backline: "Standard backline",
          lighting: "Standard lighting",
          otherRequirements: "No other requirements",
        },
        performanceArea: {
          regions: ["Catalonia", "Valencia", "Balearic Islands"],
          gasPriceCalculation: {
            fuelConsumption: 12.5,
            useDynamicPricing: true,
            pricePerLiter: 1.85,
          },
          otherComments: "No outdoor events during winter",
        },
        media: [],
        socialLinks: [],
      };

      const duplicateNotification = Notification.fromPrimitives({
        id: "0df12544-b40b-485c-b7d2-8052812288c7",
        bandId: bandId,
        userId: userId,
        isReadFromBand: false,
        isReadFromUser: false,
        createdAt: new Date("2024-03-21T10:00:00.000Z").toISOString(),
        invitationMetadata: {
          bandName: "Test Band",
          status: InvitationStatus.PENDING,
          createdAt: new Date("2024-03-21T10:00:00.000Z"),
          userName: "Test User",
        },
      });

      const mockNotifications = [
        duplicateNotification,
        duplicateNotification,
        Notification.fromPrimitives({
          id: "095a133d-5449-4974-bcf4-b6c097b89852",
          bandId: bandId,
          userId: userId,
          isReadFromBand: false,
          isReadFromUser: false,
          createdAt: new Date("2024-03-20T10:00:00.000Z").toISOString(),
          invitationMetadata: {
            bandName: "Test Band",
            status: InvitationStatus.PENDING,
            createdAt: new Date("2024-03-20T10:00:00.000Z"),
            userName: "Test User",
          },
        }),
      ];

      moduleConnectors.obtainUserInformation.mockResolvedValue(mockUser);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      notificationRepository.getAllFromUser.mockResolvedValue(
        mockNotifications,
      );

      const query = new GetAllNotificationsFromUserQuery(
        { id: userId, email: "test@example.com", role: Role.Client },
        bandId,
      );
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("0df12544-b40b-485c-b7d2-8052812288c7");
      expect(result[1].id).toBe("095a133d-5449-4974-bcf4-b6c097b89852");
    });
  });
});
