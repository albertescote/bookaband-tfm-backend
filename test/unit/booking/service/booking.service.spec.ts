import { Test, TestingModule } from "@nestjs/testing";
import { BookingService } from "../../../../src/context/booking/service/booking.service";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { EventBus } from "../../../../src/context/shared/eventBus/domain/eventBus";
import { BookingStatusChangedEvent } from "../../../../src/context/shared/eventBus/domain/bookingStatusChanged.event";
import { Booking } from "../../../../src/context/booking/domain/booking";
import { BookingWithDetails } from "../../../../src/context/booking/domain/bookingWithDetails";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { BookingNotFoundException } from "../../../../src/context/booking/exceptions/bookingNotFoundException";
import { NotOwnerOfTheRequestedBookingException } from "../../../../src/context/booking/exceptions/notOwnerOfTheRequestedBookingException";
import { NotOwnerOfTheRequestedBandException } from "../../../../src/context/booking/exceptions/notOwnerOfTheRequestedBandException";
import { BookingAlreadyProcessedException } from "../../../../src/context/booking/exceptions/bookingAlreadyProcessedException";
import { NotAbleToCreateBookingException } from "../../../../src/context/booking/exceptions/notAbleToCreateBookingException";
import { MissingUserInfoToCreateBookingException } from "../../../../src/context/booking/exceptions/missingUserInfoToCreateBookingException";
import { UserNotFoundException } from "../../../../src/context/booking/exceptions/userNotFoundException";
import { IntroducedCostDoesNotMatchTheCalculatedOneException } from "../../../../src/context/booking/exceptions/introducedCostDoesNotMatchTheCalculatedOneException";
import { GasPriceCalculator } from "../../../../src/context/booking/infrastructure/gasPriceCalculator";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import User from "../../../../src/context/shared/domain/user";

describe("BookingService", () => {
  let service: BookingService;
  let bookingRepository: jest.Mocked<BookingRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;
  let eventBus: jest.Mocked<EventBus>;
  let gasPriceCalculator: jest.Mocked<GasPriceCalculator>;

  const mockClientUserId = UserId.generate().toPrimitive();
  const mockMusicianUserId = UserId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockBookingId = BookingId.generate().toPrimitive();

  const mockClientUserAuthInfo: UserAuthInfo = {
    id: mockClientUserId,
    role: Role.Client,
    email: "client@example.com",
  };

  const mockMusicianUserAuthInfo: UserAuthInfo = {
    id: mockMusicianUserId,
    role: Role.Musician,
    email: "musician@example.com",
  };

  const mockCreateBookingRequest = {
    bandId: mockBandId,
    initDate: "2024-12-31T20:00:00.000Z",
    endDate: "2024-12-31T23:00:00.000Z",
    name: "New Year's Party",
    country: "Spain",
    city: "Barcelona",
    venue: "Beach Club",
    postalCode: "08001",
    addressLine1: "Passeig Marítim 1",
    isPublic: true,
    cost: 1000,
  };

  const mockBand = {
    id: mockBandId,
    name: "Test Band",
    location: "Madrid",
    members: [],
    musicalStyleIds: [],
    reviewCount: 0,
    followers: 0,
    following: 0,
    createdAt: new Date(),
    price: 1000,
    bandSize: "BAND",
    featured: false,
    visible: true,
    eventTypeIds: [],
    weeklyAvailability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    media: [],
    socialLinks: [],
    performanceArea: {
      regions: ["Madrid", "Barcelona"],
      gasPriceCalculation: {
        useDynamicPricing: true,
        pricePerLiter: 1.85,
        fuelConsumption: 12.5,
      },
    },
  };

  const mockBooking: Booking = {
    getId: jest.fn().mockReturnValue(new BookingId(mockBookingId)),
    getBandId: jest.fn().mockReturnValue(new BandId(mockBandId)),
    isPending: jest.fn().mockReturnValue(true),
    isClientOwner: jest.fn().mockReturnValue(true),
    accept: jest.fn(),
    decline: jest.fn(),
    cancel: jest.fn(),
    toPrimitives: jest.fn().mockReturnValue({
      id: mockBookingId,
      bandId: mockBandId,
      userId: mockClientUserId,
      status: BookingStatus.PENDING,
      initDate: new Date(mockCreateBookingRequest.initDate),
      endDate: new Date(mockCreateBookingRequest.endDate),
      name: mockCreateBookingRequest.name,
      country: mockCreateBookingRequest.country,
      city: mockCreateBookingRequest.city,
      venue: mockCreateBookingRequest.venue,
      postalCode: mockCreateBookingRequest.postalCode,
      addressLine1: mockCreateBookingRequest.addressLine1,
      isPublic: mockCreateBookingRequest.isPublic,
    }),
  } as unknown as Booking;

  const mockBookingWithDetails: BookingWithDetails = {
    getId: jest.fn().mockReturnValue(new BookingId(mockBookingId)),
    getBandId: jest.fn().mockReturnValue(new BandId(mockBandId)),
    isOwner: jest.fn().mockReturnValue(true),
    toPrimitives: jest.fn().mockReturnValue({
      id: mockBookingId,
      bandId: mockBandId,
      userId: mockClientUserId,
      status: BookingStatus.PENDING,
      initDate: new Date(mockCreateBookingRequest.initDate),
      endDate: new Date(mockCreateBookingRequest.endDate),
      name: mockCreateBookingRequest.name,
      userName: "John Doe",
      bandName: "The Band",
      country: mockCreateBookingRequest.country,
      city: mockCreateBookingRequest.city,
      venue: mockCreateBookingRequest.venue,
      postalCode: mockCreateBookingRequest.postalCode,
      addressLine1: mockCreateBookingRequest.addressLine1,
      isPublic: mockCreateBookingRequest.isPublic,
    }),
  } as unknown as BookingWithDetails;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: BookingRepository,
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
            findByIdWithDetails: jest.fn(),
            findAllByUserId: jest.fn(),
            findAllByBandId: jest.fn(),
          },
        },
        {
          provide: ModuleConnectors,
          useValue: {
            obtainUserInformation: jest.fn(),
            obtainBandMembers: jest.fn(),
            addBookingToChat: jest.fn(),
            generateContract: jest.fn(),
            getBandById: jest.fn(),
          },
        },
        {
          provide: "EventBus",
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: GasPriceCalculator,
          useValue: {
            calculateGasCost: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get(BookingRepository);
    moduleConnectors = module.get(ModuleConnectors);
    eventBus = module.get("EventBus");
    gasPriceCalculator = module.get(GasPriceCalculator);

    jest.clearAllMocks();

    (mockBooking.getId as jest.Mock).mockReturnValue(
      new BookingId(mockBookingId),
    );
    (mockBooking.getBandId as jest.Mock).mockReturnValue(
      new BandId(mockBandId),
    );
    (mockBooking.isPending as jest.Mock).mockReturnValue(true);
    (mockBooking.isClientOwner as jest.Mock).mockReturnValue(true);
    (mockBooking.accept as jest.Mock).mockClear();
    (mockBooking.decline as jest.Mock).mockClear();
    (mockBooking.cancel as jest.Mock).mockClear();
    (mockBooking.toPrimitives as jest.Mock).mockReturnValue({
      id: mockBookingId,
      bandId: mockBandId,
      userId: mockClientUserId,
      status: BookingStatus.PENDING,
      initDate: new Date(mockCreateBookingRequest.initDate),
      endDate: new Date(mockCreateBookingRequest.endDate),
      name: mockCreateBookingRequest.name,
      country: mockCreateBookingRequest.country,
      city: mockCreateBookingRequest.city,
      venue: mockCreateBookingRequest.venue,
      postalCode: mockCreateBookingRequest.postalCode,
      addressLine1: mockCreateBookingRequest.addressLine1,
      isPublic: mockCreateBookingRequest.isPublic,
    });

    (mockBookingWithDetails.getId as jest.Mock).mockReturnValue(
      new BookingId(mockBookingId),
    );
    (mockBookingWithDetails.getBandId as jest.Mock).mockReturnValue(
      new BandId(mockBandId),
    );
    (mockBookingWithDetails.isOwner as jest.Mock).mockReturnValue(true);

    moduleConnectors.obtainBandMembers.mockResolvedValue([mockMusicianUserId]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("should create a new booking successfully", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockClientUserAuthInfo.id,
          firstName: "John",
          familyName: "Doe",
          email: mockClientUserAuthInfo.email,
          role: mockClientUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      gasPriceCalculator.calculateGasCost.mockResolvedValue({
        distance: 500,
        pricePerLiter: 1.85,
        gasCost: 1000,
      });
      bookingRepository.save.mockResolvedValue(mockBooking);

      const result = await service.create(
        mockClientUserAuthInfo,
        mockCreateBookingRequest,
      );

      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        mockClientUserId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(mockBandId);
      expect(gasPriceCalculator.calculateGasCost).toHaveBeenCalledWith({
        artistLocation: mockBand.location,
        bookingLocation: mockCreateBookingRequest.city,
        useDynamicPricing:
          mockBand.performanceArea.gasPriceCalculation.useDynamicPricing,
        fallbackPricePerLiter:
          mockBand.performanceArea.gasPriceCalculation.pricePerLiter,
        fuelConsumption:
          mockBand.performanceArea.gasPriceCalculation.fuelConsumption,
      });
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(moduleConnectors.addBookingToChat).toHaveBeenCalledWith(
        mockBandId,
        mockClientUserId,
        expect.any(String),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(BookingStatusChangedEvent),
      );
      expect(result).toEqual(mockBooking.toPrimitives());
    });

    it("should throw IntroducedCostDoesNotMatchTheCalculatedOneException when cost doesn't match", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockClientUserAuthInfo.id,
          firstName: "John",
          familyName: "Doe",
          email: mockClientUserAuthInfo.email,
          role: mockClientUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      gasPriceCalculator.calculateGasCost.mockResolvedValue({
        distance: 500,
        pricePerLiter: 1.85,
        gasCost: 1500,
      });

      await expect(
        service.create(mockClientUserAuthInfo, mockCreateBookingRequest),
      ).rejects.toThrow(IntroducedCostDoesNotMatchTheCalculatedOneException);
    });

    it("should throw IntroducedCostDoesNotMatchTheCalculatedOneException when band has no gas price calculation", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockClientUserAuthInfo.id,
          firstName: "John",
          familyName: "Doe",
          email: mockClientUserAuthInfo.email,
          role: mockClientUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      moduleConnectors.getBandById.mockResolvedValue({
        ...mockBand,
        performanceArea: {
          regions: ["Madrid", "Barcelona"],
          gasPriceCalculation: null,
        },
      });
      gasPriceCalculator.calculateGasCost.mockResolvedValue({
        distance: 0,
        pricePerLiter: 0,
        gasCost: 0,
      });

      await expect(
        service.create(mockClientUserAuthInfo, mockCreateBookingRequest),
      ).rejects.toThrow(IntroducedCostDoesNotMatchTheCalculatedOneException);
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(null);

      await expect(
        service.create(mockClientUserAuthInfo, mockCreateBookingRequest),
      ).rejects.toThrow(UserNotFoundException);
    });

    it("should throw MissingUserInfoToCreateBookingException when user info is incomplete", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockClientUserAuthInfo.id,
          firstName: "John",
          familyName: "Doe",
          email: mockClientUserAuthInfo.email,
          role: mockClientUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
        }),
      );

      await expect(
        service.create(mockClientUserAuthInfo, mockCreateBookingRequest),
      ).rejects.toThrow(MissingUserInfoToCreateBookingException);
    });

    it("should throw NotAbleToCreateBookingException when booking cannot be saved", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockClientUserAuthInfo.id,
          firstName: "John",
          familyName: "Doe",
          email: mockClientUserAuthInfo.email,
          role: mockClientUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      gasPriceCalculator.calculateGasCost.mockResolvedValue({
        distance: 500,
        pricePerLiter: 1.85,
        gasCost: 1000,
      });
      bookingRepository.save.mockResolvedValue(null);

      await expect(
        service.create(mockClientUserAuthInfo, mockCreateBookingRequest),
      ).rejects.toThrow(NotAbleToCreateBookingException);
      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        mockClientUserId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(mockBandId);
      expect(gasPriceCalculator.calculateGasCost).toHaveBeenCalledWith({
        artistLocation: mockBand.location,
        bookingLocation: mockCreateBookingRequest.city,
        useDynamicPricing:
          mockBand.performanceArea.gasPriceCalculation.useDynamicPricing,
        fallbackPricePerLiter:
          mockBand.performanceArea.gasPriceCalculation.pricePerLiter,
        fuelConsumption:
          mockBand.performanceArea.gasPriceCalculation.fuelConsumption,
      });
    });
  });

  describe("getById", () => {
    it("should return booking details when user is the owner", async () => {
      bookingRepository.findByIdWithDetails.mockResolvedValue(
        mockBookingWithDetails,
      );
      moduleConnectors.obtainBandMembers.mockResolvedValue([mockClientUserId]);

      const result = await service.getById(
        mockClientUserAuthInfo,
        mockBookingId,
      );

      expect(bookingRepository.findByIdWithDetails).toHaveBeenCalledWith(
        expect.any(BookingId),
      );
      expect(result).toEqual(mockBookingWithDetails.toPrimitives());
    });

    it("should return booking details when user is a band member", async () => {
      (mockBookingWithDetails.isOwner as jest.Mock).mockReturnValue(false);
      moduleConnectors.obtainBandMembers.mockResolvedValue([mockClientUserId]);
      bookingRepository.findByIdWithDetails.mockResolvedValue(
        mockBookingWithDetails,
      );

      const result = await service.getById(
        mockClientUserAuthInfo,
        mockBookingId,
      );

      expect(bookingRepository.findByIdWithDetails).toHaveBeenCalledWith(
        expect.any(BookingId),
      );
      expect(result).toEqual(mockBookingWithDetails.toPrimitives());
    });

    it("should throw BookingNotFoundException when booking is not found", async () => {
      bookingRepository.findByIdWithDetails.mockResolvedValue(null);

      await expect(
        service.getById(mockClientUserAuthInfo, mockBookingId),
      ).rejects.toThrow(BookingNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBookingException when user is not authorized", async () => {
      (mockBookingWithDetails.isOwner as jest.Mock).mockReturnValue(false);
      moduleConnectors.obtainBandMembers.mockResolvedValue([]);
      bookingRepository.findByIdWithDetails.mockResolvedValue(
        mockBookingWithDetails,
      );

      await expect(
        service.getById(mockClientUserAuthInfo, mockBookingId),
      ).rejects.toThrow(NotOwnerOfTheRequestedBookingException);
    });
  });

  describe("getAllFromClient", () => {
    it("should return all bookings for a client", async () => {
      const mockBookings = [mockBookingWithDetails];
      bookingRepository.findAllByUserId.mockResolvedValue(mockBookings);

      const result = await service.getAllFromClient(mockClientUserAuthInfo);

      expect(bookingRepository.findAllByUserId).toHaveBeenCalledWith(
        expect.any(UserId),
      );
      expect(result).toEqual([mockBookingWithDetails.toPrimitives()]);
    });
  });

  describe("getAllFromBand", () => {
    it("should return all bookings for a band when user is a member", async () => {
      const mockBookings = [mockBookingWithDetails];
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockMusicianUserId,
      ]);
      bookingRepository.findAllByBandId.mockResolvedValue(mockBookings);

      const result = await service.getAllFromBand(
        mockMusicianUserAuthInfo,
        mockBandId,
      );

      expect(moduleConnectors.obtainBandMembers).toHaveBeenCalledWith(
        mockBandId,
      );
      expect(bookingRepository.findAllByBandId).toHaveBeenCalledWith(
        expect.any(BandId),
      );
      expect(result).toEqual([mockBookingWithDetails.toPrimitives()]);
    });

    it("should throw NotOwnerOfTheRequestedBandException when user is not a band member", async () => {
      moduleConnectors.obtainBandMembers.mockResolvedValue([]);

      await expect(
        service.getAllFromBand(mockMusicianUserAuthInfo, mockBandId),
      ).rejects.toThrow(NotOwnerOfTheRequestedBandException);
    });
  });

  describe("acceptBooking", () => {
    it("should accept a booking successfully", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockMusicianUserId,
      ]);

      const result = await service.acceptBooking(
        mockMusicianUserAuthInfo,
        mockBookingId,
      );

      expect(bookingRepository.findById).toHaveBeenCalledWith(
        expect.any(BookingId),
      );
      expect(mockBooking.accept).toHaveBeenCalled();
      expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
      expect(moduleConnectors.generateContract).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(BookingStatusChangedEvent),
      );
      expect(result).toEqual(mockBooking.toPrimitives());
    });

    it("should throw BookingNotFoundException when booking is not found", async () => {
      bookingRepository.findById.mockResolvedValue(null);

      await expect(
        service.acceptBooking(mockMusicianUserAuthInfo, mockBookingId),
      ).rejects.toThrow(BookingNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBookingException when user is not a band member", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue([]);

      await expect(
        service.acceptBooking(mockMusicianUserAuthInfo, mockBookingId),
      ).rejects.toThrow(NotOwnerOfTheRequestedBookingException);
    });

    it("should throw BookingAlreadyProcessedException when booking is not pending", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockMusicianUserId,
      ]);
      (mockBooking.isPending as jest.Mock).mockReturnValue(false);

      await expect(
        service.acceptBooking(mockMusicianUserAuthInfo, mockBookingId),
      ).rejects.toThrow(BookingAlreadyProcessedException);
    });
  });

  describe("declineBooking", () => {
    it("should decline a booking successfully", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockMusicianUserId,
      ]);

      const result = await service.declineBooking(
        mockMusicianUserAuthInfo,
        mockBookingId,
      );

      expect(bookingRepository.findById).toHaveBeenCalledWith(
        expect.any(BookingId),
      );
      expect(mockBooking.decline).toHaveBeenCalled();
      expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(BookingStatusChangedEvent),
      );
      expect(result).toEqual(mockBooking.toPrimitives());
    });

    it("should throw BookingNotFoundException when booking is not found", async () => {
      bookingRepository.findById.mockResolvedValue(null);

      await expect(
        service.declineBooking(mockMusicianUserAuthInfo, mockBookingId),
      ).rejects.toThrow(BookingNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBookingException when user is not a band member", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue([]);

      await expect(
        service.declineBooking(mockMusicianUserAuthInfo, mockBookingId),
      ).rejects.toThrow(NotOwnerOfTheRequestedBookingException);
    });

    it("should throw BookingAlreadyProcessedException when booking is not pending", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockMusicianUserId,
      ]);
      (mockBooking.isPending as jest.Mock).mockReturnValue(false);

      await expect(
        service.declineBooking(mockMusicianUserAuthInfo, mockBookingId),
      ).rejects.toThrow(BookingAlreadyProcessedException);
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking successfully", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);

      const result = await service.cancelBooking(
        mockClientUserAuthInfo,
        mockBookingId,
      );

      expect(bookingRepository.findById).toHaveBeenCalledWith(
        expect.any(BookingId),
      );
      expect(mockBooking.cancel).toHaveBeenCalled();
      expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(BookingStatusChangedEvent),
      );
      expect(result).toEqual(mockBooking.toPrimitives());
    });

    it("should throw BookingNotFoundException when booking is not found", async () => {
      bookingRepository.findById.mockResolvedValue(null);

      await expect(
        service.cancelBooking(mockClientUserAuthInfo, mockBookingId),
      ).rejects.toThrow(BookingNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBookingException when user is not the owner", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      (mockBooking.isClientOwner as jest.Mock).mockReturnValue(false);

      await expect(
        service.cancelBooking(mockClientUserAuthInfo, mockBookingId),
      ).rejects.toThrow(NotOwnerOfTheRequestedBookingException);
    });

    it("should throw BookingAlreadyProcessedException when booking is not pending", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      (mockBooking.isPending as jest.Mock).mockReturnValue(false);

      await expect(
        service.cancelBooking(mockClientUserAuthInfo, mockBookingId),
      ).rejects.toThrow(BookingAlreadyProcessedException);
    });
  });
});
