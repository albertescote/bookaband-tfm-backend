import { CreateArtistReviewCommandHandler } from "../../../../src/context/artistReview/service/createArtistReview.commandHandler";
import { CreateArtistReviewCommand } from "../../../../src/context/artistReview/service/createArtistReview.command";
import { ArtistReviewRepository } from "../../../../src/context/artistReview/infrastructure/artistReview.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { ArtistReview } from "../../../../src/context/artistReview/domain/artistReview";
import { BookingPrimitives } from "../../../../src/context/booking/domain/booking";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { NotOwnerOfTheRequestedBookingException } from "../../../../src/context/artistReview/exceptions/notOwnerOfTheRequestedBookingException";
import { UnableToCreateReviewForBookingNotPaidException } from "../../../../src/context/artistReview/exceptions/unableToCreateReviewForBookingNotPaidException";
import { UnableToStoreArtistReviewException } from "../../../../src/context/artistReview/exceptions/unableToStoreArtistReviewException";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";
import { ArtistReviewId } from "../../../../src/context/artistReview/domain/artistReviewId";

describe("CreateArtistReviewCommandHandler", () => {
  let handler: CreateArtistReviewCommandHandler;
  let artistReviewRepository: jest.Mocked<ArtistReviewRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const mockBookingId = BookingId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();
  const mockRating = 5;
  const mockComment = "Great performance!";
  const mockUserAuthInfo: UserAuthInfo = {
    id: mockUserId,
    email: "test@example.com",
    role: "Client",
  };

  const mockCommand = new CreateArtistReviewCommand(
    mockBookingId,
    mockRating,
    mockComment,
    mockUserAuthInfo,
  );

  const mockBooking: BookingPrimitives = {
    id: mockBookingId,
    bandId: mockBandId,
    userId: mockUserId,
    status: BookingStatus.PAID,
    initDate: new Date(),
    endDate: new Date(),
    cost: 1000,
    name: "Test Event",
    country: "Test Country",
    city: "Test City",
    venue: "Test Venue",
    postalCode: "12345",
    addressLine1: "Test Address 1",
    addressLine2: "Test Address 2",
    eventTypeId: EventTypeId.generate().toPrimitive(),
    isPublic: true,
  };

  const mockArtistReview: ArtistReview = {
    toPrimitives: jest.fn().mockReturnValue({
      id: ArtistReviewId.generate().toPrimitive(),
      userId: mockUserId,
      bandId: mockBandId,
      rating: mockRating,
      comment: mockComment,
      date: new Date(),
    }),
  } as unknown as ArtistReview;

  beforeEach(() => {
    artistReviewRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<ArtistReviewRepository>;

    moduleConnectors = {
      getBookingById: jest.fn(),
    } as unknown as jest.Mocked<ModuleConnectors>;

    handler = new CreateArtistReviewCommandHandler(
      artistReviewRepository,
      moduleConnectors,
    );
  });

  describe("execute", () => {
    it("should create an artist review successfully when booking is paid and user is owner", async () => {
      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      artistReviewRepository.create.mockResolvedValue(mockArtistReview);

      await handler.execute(mockCommand);

      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(artistReviewRepository.create).toHaveBeenCalledWith(
        expect.any(ArtistReview),
      );
    });

    it("should throw NotOwnerOfTheRequestedBookingException when user is not the booking owner", async () => {
      const differentUserId = UserId.generate().toPrimitive();
      const bookingWithDifferentUser = {
        ...mockBooking,
        userId: differentUserId,
      };
      moduleConnectors.getBookingById.mockResolvedValue(
        bookingWithDifferentUser,
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        NotOwnerOfTheRequestedBookingException,
      );
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(artistReviewRepository.create).not.toHaveBeenCalled();
    });

    it("should throw UnableToCreateReviewForBookingNotPaidException when booking status is not PAID", async () => {
      const bookingNotPaid = {
        ...mockBooking,
        status: BookingStatus.PENDING,
      };
      moduleConnectors.getBookingById.mockResolvedValue(bookingNotPaid);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        UnableToCreateReviewForBookingNotPaidException,
      );
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(artistReviewRepository.create).not.toHaveBeenCalled();
    });

    it("should throw UnableToStoreArtistReviewException when repository returns undefined", async () => {
      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      artistReviewRepository.create.mockResolvedValue(undefined);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        UnableToStoreArtistReviewException,
      );
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(artistReviewRepository.create).toHaveBeenCalledWith(
        expect.any(ArtistReview),
      );
    });

    it("should handle different booking statuses correctly", async () => {
      const testCases = [
        { status: BookingStatus.PENDING, shouldThrow: true },
        { status: BookingStatus.ACCEPTED, shouldThrow: true },
        { status: BookingStatus.SIGNED, shouldThrow: true },
        { status: BookingStatus.PAID, shouldThrow: false },
        { status: BookingStatus.CANCELED, shouldThrow: true },
      ];

      for (const testCase of testCases) {
        const bookingWithStatus = {
          ...mockBooking,
          status: testCase.status,
        };
        moduleConnectors.getBookingById.mockResolvedValue(bookingWithStatus);
        artistReviewRepository.create.mockResolvedValue(mockArtistReview);

        if (testCase.shouldThrow) {
          await expect(handler.execute(mockCommand)).rejects.toThrow(
            UnableToCreateReviewForBookingNotPaidException,
          );
        } else {
          await expect(handler.execute(mockCommand)).resolves.not.toThrow();
        }
      }
    });

    it("should handle module connectors errors gracefully", async () => {
      moduleConnectors.getBookingById.mockRejectedValue(
        new Error("Module Connector error"),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        "Module Connector error",
      );
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(artistReviewRepository.create).not.toHaveBeenCalled();
    });
  });
});
