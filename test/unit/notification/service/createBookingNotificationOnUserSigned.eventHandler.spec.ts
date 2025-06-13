import { Test, TestingModule } from "@nestjs/testing";
import { CreateBookingNotificationOnUserSignedEventHandler } from "../../../../src/context/notification/service/createBookingNotificationOnUserSigned.eventHandler";
import { NotificationRepository } from "../../../../src/context/notification/infrastructure/notifications.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { UserSignedContractEvent } from "../../../../src/context/shared/eventBus/domain/userSignedContract.event";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";

describe("CreateBookingNotificationOnUserSignedEventHandler", () => {
  let handler: CreateBookingNotificationOnUserSignedEventHandler;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const bookingId = BookingId.generate().toPrimitive();

  const mockEvent = new UserSignedContractEvent(
    bookingId,
    "John Doe",
    "Test Band",
    "Test Event",
  );

  beforeEach(async () => {
    notificationRepository = {
      create: jest.fn(),
    } as any;

    moduleConnectors = {
      getBookingById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBookingNotificationOnUserSignedEventHandler,
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

    handler = module.get<CreateBookingNotificationOnUserSignedEventHandler>(
      CreateBookingNotificationOnUserSignedEventHandler,
    );
  });

  describe("handle", () => {
    it("should create a notification when user signs contract", async () => {
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

      await handler.handle(mockEvent);

      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(bookingId);
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
        status: "userSigned",
      });
    });
  });
});
