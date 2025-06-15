import { Test, TestingModule } from "@nestjs/testing";
import { BookingController } from "../../../../src/app/api/booking/booking.controller";
import { BookingService } from "../../../../src/context/booking/service/booking.service";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { CreateBookingRequestDto } from "../../../../src/app/api/booking/createBookingRequest.dto";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";

describe("BookingController", () => {
  let controller: BookingController;

  const mockBookingService = {
    create: jest.fn(),
    getAllFromClient: jest.fn(),
    getBookingContract: jest.fn(),
    getBookingInvoice: jest.fn(),
    getById: jest.fn(),
    getAllFromBand: jest.fn(),
    acceptBooking: jest.fn(),
    declineBooking: jest.fn(),
    cancelBooking: jest.fn(),
  };

  const mockUser: UserAuthInfo = {
    id: "1",
    email: "test@example.com",
    role: Role.Client,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createBooking", () => {
    it("should create a new booking", async () => {
      const createBookingDto: CreateBookingRequestDto = {
        bandId: "band-123",
        initDate: "2024-04-01T10:00:00Z",
        endDate: "2024-04-01T12:00:00Z",
        name: "Wedding Party",
        country: "Spain",
        city: "Barcelona",
        venue: "Grand Hotel",
        postalCode: "08001",
        addressLine1: "Main Street 123",
        addressLine2: "Floor 4",
        eventTypeId: "event-123",
        isPublic: true,
        cost: 1000,
      };

      const expectedResponse = {
        id: "booking-123",
        ...createBookingDto,
        userId: mockUser.id,
        status: BookingStatus.PENDING,
        initDate: new Date(createBookingDto.initDate),
        endDate: new Date(createBookingDto.endDate),
      };

      mockBookingService.create.mockResolvedValue(expectedResponse);

      const result = await controller.createBooking(createBookingDto, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.create).toHaveBeenCalledWith(
        mockUser,
        createBookingDto,
      );
    });
  });

  describe("getAllFromClient", () => {
    it("should return all bookings for a client", async () => {
      const expectedResponse = [
        {
          id: "booking-123",
          bandId: "band-123",
          userId: mockUser.id,
          status: BookingStatus.PENDING,
          initDate: new Date(),
          endDate: new Date(),
          name: "Wedding Party",
          country: "Spain",
          city: "Barcelona",
          venue: "Grand Hotel",
          postalCode: "08001",
          addressLine1: "Main Street 123",
          bandName: "The Band",
          bandImage: "band-image.jpg",
        },
      ];

      mockBookingService.getAllFromClient.mockResolvedValue(expectedResponse);

      const result = await controller.getAllFromClient({ user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.getAllFromClient).toHaveBeenCalledWith(
        mockUser,
      );
    });
  });

  describe("getBookingContract", () => {
    it("should return booking contract", async () => {
      const bookingId = "booking-123";
      const expectedResponse = {
        id: "contract-123",
        bookingId: bookingId,
        status: "PENDING",
        fileUrl: "https://example.com/contract.pdf",
        userSigned: false,
        bandSigned: false,
      };

      mockBookingService.getBookingContract.mockResolvedValue(expectedResponse);

      const result = await controller.getBookingContract(bookingId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.getBookingContract).toHaveBeenCalledWith(
        mockUser,
        bookingId,
      );
    });
  });

  describe("getBookingInvoice", () => {
    it("should return booking invoice", async () => {
      const bookingId = "booking-123";
      const expectedResponse = {
        id: "invoice-123",
        bookingId: bookingId,
        amount: 1000,
        currency: "EUR",
        status: "PENDING",
        fileUrl: "https://example.com/invoice.pdf",
      };

      mockBookingService.getBookingInvoice.mockResolvedValue(expectedResponse);

      const result = await controller.getBookingInvoice(bookingId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.getBookingInvoice).toHaveBeenCalledWith(
        mockUser,
        bookingId,
      );
    });
  });

  describe("getById", () => {
    it("should return a booking by id", async () => {
      const bookingId = "booking-123";
      const expectedResponse = {
        id: bookingId,
        bandId: "band-123",
        userId: mockUser.id,
        status: BookingStatus.PENDING,
        initDate: new Date(),
        endDate: new Date(),
        name: "Wedding Party",
        country: "Spain",
        city: "Barcelona",
        venue: "Grand Hotel",
        postalCode: "08001",
        addressLine1: "Main Street 123",
        bandName: "The Band",
        bandImage: "band-image.jpg",
      };

      mockBookingService.getById.mockResolvedValue(expectedResponse);

      const result = await controller.getById(bookingId, { user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.getById).toHaveBeenCalledWith(
        mockUser,
        bookingId,
      );
    });
  });

  describe("getAllFromBand", () => {
    it("should return all bookings for a band", async () => {
      const bandId = "band-123";
      const expectedResponse = [
        {
          id: "booking-123",
          bandId: bandId,
          userId: mockUser.id,
          status: BookingStatus.PENDING,
          initDate: new Date(),
          endDate: new Date(),
          name: "Wedding Party",
          country: "Spain",
          city: "Barcelona",
          venue: "Grand Hotel",
          postalCode: "08001",
          addressLine1: "Main Street 123",
          userName: "John Doe",
          userImage: "user-image.jpg",
        },
      ];

      mockBookingService.getAllFromBand.mockResolvedValue(expectedResponse);

      const result = await controller.getAllFromBand(bandId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.getAllFromBand).toHaveBeenCalledWith(
        mockUser,
        bandId,
      );
    });
  });

  describe("acceptBooking", () => {
    it("should accept a booking", async () => {
      const bookingId = "booking-123";
      const expectedResponse = {
        id: bookingId,
        bandId: "band-123",
        userId: mockUser.id,
        status: BookingStatus.ACCEPTED,
        initDate: new Date(),
        endDate: new Date(),
        name: "Wedding Party",
        country: "Spain",
        city: "Barcelona",
        venue: "Grand Hotel",
        postalCode: "08001",
        addressLine1: "Main Street 123",
      };

      mockBookingService.acceptBooking.mockResolvedValue(expectedResponse);

      const result = await controller.acceptBooking(bookingId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.acceptBooking).toHaveBeenCalledWith(
        mockUser,
        bookingId,
      );
    });
  });

  describe("declineBooking", () => {
    it("should decline a booking", async () => {
      const bookingId = "booking-123";
      const expectedResponse = {
        id: bookingId,
        bandId: "band-123",
        userId: mockUser.id,
        status: BookingStatus.DECLINED,
        initDate: new Date(),
        endDate: new Date(),
        name: "Wedding Party",
        country: "Spain",
        city: "Barcelona",
        venue: "Grand Hotel",
        postalCode: "08001",
        addressLine1: "Main Street 123",
      };

      mockBookingService.declineBooking.mockResolvedValue(expectedResponse);

      const result = await controller.declineBooking(bookingId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.declineBooking).toHaveBeenCalledWith(
        mockUser,
        bookingId,
      );
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking", async () => {
      const bookingId = "booking-123";
      const expectedResponse = {
        id: bookingId,
        bandId: "band-123",
        userId: mockUser.id,
        status: BookingStatus.CANCELED,
        initDate: new Date(),
        endDate: new Date(),
        name: "Wedding Party",
        country: "Spain",
        city: "Barcelona",
        venue: "Grand Hotel",
        postalCode: "08001",
        addressLine1: "Main Street 123",
      };

      mockBookingService.cancelBooking.mockResolvedValue(expectedResponse);

      const result = await controller.cancelBooking(bookingId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockBookingService.cancelBooking).toHaveBeenCalledWith(
        mockUser,
        bookingId,
      );
    });
  });
});
