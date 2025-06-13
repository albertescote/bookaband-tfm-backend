import { Test, TestingModule } from "@nestjs/testing";
import { GetBookingByIdQueryHandler } from "../../../../src/context/booking/service/getBookingById.queryHandler";
import { GetBookingByIdQuery } from "../../../../src/context/booking/service/getBookingById.query";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import { Booking } from "../../../../src/context/booking/domain/booking";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import { BookingNotFoundException } from "../../../../src/context/booking/exceptions/bookingNotFoundException";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";

describe("GetBookingByIdQueryHandler", () => {
  let handler: GetBookingByIdQueryHandler;
  let bookingRepository: jest.Mocked<BookingRepository>;

  const mockBookingId = BookingId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();

  const mockBooking: Booking = {
    toPrimitives: jest.fn().mockReturnValue({
      id: mockBookingId,
      bandId: mockBandId,
      userId: mockUserId,
      status: BookingStatus.PENDING,
      initDate: new Date("2024-12-31T20:00:00.000Z"),
      endDate: new Date("2024-12-31T23:00:00.000Z"),
      name: "Event Name",
      country: "Spain",
      city: "Barcelona",
      venue: "Beach Club",
      postalCode: "08001",
      addressLine1: "Passeig Marítim 1",
      isPublic: true,
    }),
  } as unknown as Booking;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookingByIdQueryHandler,
        {
          provide: BookingRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetBookingByIdQueryHandler>(
      GetBookingByIdQueryHandler,
    );
    bookingRepository = module.get(BookingRepository);
  });

  describe("execute", () => {
    it("should return booking primitives when booking exists for ID", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      const query = new GetBookingByIdQuery(mockBookingId);
      const result = await handler.execute(query);
      expect(bookingRepository.findById).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
      expect(result).toEqual(mockBooking.toPrimitives());
    });

    it("should throw BookingNotFoundException when no booking exists for ID", async () => {
      bookingRepository.findById.mockResolvedValue(undefined);
      const query = new GetBookingByIdQuery(mockBookingId);
      await expect(handler.execute(query)).rejects.toThrow(
        BookingNotFoundException,
      );
    });
  });
});
