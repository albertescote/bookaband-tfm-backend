import { Test, TestingModule } from "@nestjs/testing";
import { GetUserIdByBookingIdQueryHandler } from "../../../../src/context/booking/service/getUserIdByBookingId.queryHandler";
import { GetUserIdByBookingIdQuery } from "../../../../src/context/booking/service/getUserIdByBookingId.query";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import { Booking } from "../../../../src/context/booking/domain/booking";
import UserId from "../../../../src/context/shared/domain/userId";

describe("GetUserIdByBookingIdQueryHandler", () => {
  let handler: GetUserIdByBookingIdQueryHandler;
  let bookingRepository: jest.Mocked<BookingRepository>;

  const mockBookingId = BookingId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();

  const mockBooking: Booking = {
    getId: jest.fn().mockReturnValue(new BookingId(mockBookingId)),
    getUserId: jest.fn().mockReturnValue({ toPrimitive: () => mockUserId }),
  } as unknown as Booking;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserIdByBookingIdQueryHandler,
        {
          provide: BookingRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetUserIdByBookingIdQueryHandler>(
      GetUserIdByBookingIdQueryHandler,
    );
    bookingRepository = module.get(BookingRepository);
  });

  describe("execute", () => {
    it("should return user id when booking exists for ID", async () => {
      bookingRepository.findById.mockResolvedValue(mockBooking);
      const query = new GetUserIdByBookingIdQuery(mockBookingId);
      const result = await handler.execute(query);
      expect(bookingRepository.findById).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
      expect(result).toBe(mockBooking.getId().toPrimitive());
    });

    it("should return undefined when no booking exists for ID", async () => {
      bookingRepository.findById.mockResolvedValue(undefined);
      const query = new GetUserIdByBookingIdQuery(mockBookingId);
      const result = await handler.execute(query);
      expect(bookingRepository.findById).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
      expect(result).toBeUndefined();
    });
  });
});
