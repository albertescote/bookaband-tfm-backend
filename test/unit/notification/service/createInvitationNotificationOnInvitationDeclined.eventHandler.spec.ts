import { Test, TestingModule } from "@nestjs/testing";
import { CreateInvitationNotificationOnInvitationDeclinedEventHandler } from "../../../../src/context/notification/service/createInvitationNotificationOnInvitationDeclined.eventHandler";
import { NotificationRepository } from "../../../../src/context/notification/infrastructure/notifications.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { InvitationDeclinedEvent } from "../../../../src/context/shared/eventBus/domain/invitationDeclined.event";
import { BandNotFoundException } from "../../../../src/context/notification/exceptions/bandNotFoundException";
import { InvitationStatus } from "../../../../src/context/shared/domain/invitationStatus";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import { BandPrimitives } from "../../../../src/context/band/domain/band";
import { BandSize } from "../../../../src/context/band/domain/bandSize";

describe("CreateInvitationNotificationOnInvitationDeclinedEventHandler", () => {
  let handler: CreateInvitationNotificationOnInvitationDeclinedEventHandler;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const bandId = BandId.generate().toPrimitive();
  const userId = UserId.generate().toPrimitive();

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
    hospitalityRider: {
      accommodation: "accommodation description",
      catering: "catering description",
      beverages: "beverages description",
      specialRequirements: "special requirements description",
    },
    technicalRider: {
      soundSystem: "Test",
      microphones: "Test",
      backline: "Test",
      lighting: "Test",
    },
    performanceArea: {
      regions: ["Catalonia", "Valencia", "Balearic Islands"],
      gasPriceCalculation: {
        fuelConsumption: 12.5,
        useDynamicPricing: false,
        pricePerLiter: 1.85,
      },
      otherComments: "No outdoor events during winter",
    },
    rating: 0,
    media: [],
    socialLinks: [],
  };

  const mockEvent = new InvitationDeclinedEvent(bandId, userId, "John Doe");

  beforeEach(async () => {
    notificationRepository = {
      create: jest.fn(),
    } as any;

    moduleConnectors = {
      getBandById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvitationNotificationOnInvitationDeclinedEventHandler,
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

    handler =
      module.get<CreateInvitationNotificationOnInvitationDeclinedEventHandler>(
        CreateInvitationNotificationOnInvitationDeclinedEventHandler,
      );
  });

  describe("handle", () => {
    it("should create a notification when band exists", async () => {
      moduleConnectors.getBandById.mockResolvedValue(mockBand);

      await handler.handle(mockEvent);

      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(bandId);
      expect(notificationRepository.create).toHaveBeenCalled();
      const createdNotification =
        notificationRepository.create.mock.calls[0][0];
      expect(createdNotification).toBeDefined();
      const notificationPrimitives = createdNotification.toPrimitives();
      expect(notificationPrimitives.invitationMetadata).toEqual({
        userName: "John Doe",
        bandName: "Test Band",
        status: InvitationStatus.DECLINED,
      });
    });

    it("should throw BandNotFoundException when band does not exist", async () => {
      moduleConnectors.getBandById.mockResolvedValue(null);

      await expect(handler.handle(mockEvent)).rejects.toThrow(
        new BandNotFoundException(bandId),
      );
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });
  });
});
