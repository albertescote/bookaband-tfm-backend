import { Test, TestingModule } from "@nestjs/testing";
import { CreateBookingNotificationOnBookingStatusChangedEventHandler } from "../../../../src/context/notification/service/createBookingNotificationOnBookingStatusChanged.eventHandler";
import { NotificationRepository } from "../../../../src/context/notification/infrastructure/notifications.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { BookingStatusChangedEvent } from "../../../../src/context/shared/eventBus/domain/bookingStatusChanged.event";
import UserId from "../../../../src/context/shared/domain/userId";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import { BookingNotFoundException } from "../../../../src/context/notification/exceptions/bookingNotFoundException";
import { UserNotFoundException } from "../../../../src/context/notification/exceptions/userNotFoundException";
import { BandNotFoundException } from "../../../../src/context/notification/exceptions/bandNotFoundException";
import { Role } from "../../../../src/context/shared/domain/role";
import User from "../../../../src/context/shared/domain/user";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { BandPrimitives } from "../../../../src/context/band/domain/band";

describe("CreateBookingNotificationOnBookingStatusChangedEventHandler", () => {
  let handler: CreateBookingNotificationOnBookingStatusChangedEventHandler;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const bookingId = BookingId.generate().toPrimitive();

  const mockEvent = new BookingStatusChangedEvent(bookingId);

  beforeEach(async () => {
    notificationRepository = {
      create: jest.fn(),
    } as any;

    moduleConnectors = {
      getBookingById: jest.fn(),
      obtainUserInformation: jest.fn(),
      getBandById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBookingNotificationOnBookingStatusChangedEventHandler,
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
      module.get<CreateBookingNotificationOnBookingStatusChangedEventHandler>(
        CreateBookingNotificationOnBookingStatusChangedEventHandler,
      );
  });

  describe("handle", () => {
    it("should create a notification when booking status changes", async () => {
      const mockBooking = {
        id: bookingId,
        bandId: BandId.generate().toPrimitive(),
        userId: UserId.generate().toPrimitive(),
        name: "Test Event",
        status: BookingStatus.ACCEPTED,
        initDate: new Date(),
        endDate: new Date(),
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "event-type-123",
        isPublic: true,
      };

      const mockUser = new User(
        new UserId(mockBooking.userId),
        "John",
        "Doe",
        "john.doe@example.com",
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
        id: mockBooking.bandId,
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

      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainUserInformation.mockResolvedValue(mockUser);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);

      await handler.handle(mockEvent);

      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(bookingId);
      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        mockBooking.userId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(
        mockBooking.bandId,
      );
      expect(notificationRepository.create).toHaveBeenCalled();
      const createdNotification =
        notificationRepository.create.mock.calls[0][0];
      expect(createdNotification).toBeDefined();
      const notificationPrimitives = createdNotification.toPrimitives();
      expect(notificationPrimitives.bookingMetadata).toEqual({
        bookingId: bookingId,
        bandName: "Test Band",
        userName: "John Doe",
        eventName: "Test Event",
        status: "accepted",
      });
    });

    it("should throw BookingNotFoundException when booking does not exist", async () => {
      moduleConnectors.getBookingById.mockResolvedValue(null);

      await expect(handler.handle(mockEvent)).rejects.toThrow(
        new BookingNotFoundException(bookingId),
      );
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });

    it("should throw UserNotFoundException when user does not exist", async () => {
      const mockBooking = {
        id: bookingId,
        bandId: BandId.generate().toPrimitive(),
        userId: UserId.generate().toPrimitive(),
        name: "Test Event",
        status: BookingStatus.ACCEPTED,
        initDate: new Date(),
        endDate: new Date(),
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "event-type-123",
        isPublic: true,
      };

      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainUserInformation.mockResolvedValue(null);

      await expect(handler.handle(mockEvent)).rejects.toThrow(
        new UserNotFoundException(mockBooking.userId),
      );
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });

    it("should throw BandNotFoundException when band does not exist", async () => {
      const mockBooking = {
        id: bookingId,
        bandId: BandId.generate().toPrimitive(),
        userId: UserId.generate().toPrimitive(),
        name: "Test Event",
        status: BookingStatus.ACCEPTED,
        initDate: new Date(),
        endDate: new Date(),
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "event-type-123",
        isPublic: true,
      };

      const mockUser = new User(
        new UserId(mockBooking.userId),
        "John",
        "Doe",
        "john.doe@example.com",
        Role.Client,
        true,
        new Date(),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainUserInformation.mockResolvedValue(mockUser);
      moduleConnectors.getBandById.mockResolvedValue(undefined);

      await expect(handler.handle(mockEvent)).rejects.toThrow(
        new BandNotFoundException(mockBooking.bandId),
      );
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });
  });
});
