import { Test, TestingModule } from "@nestjs/testing";
import { GetBookingPriceQueryHandler } from "../../../../src/context/booking/service/getBookingPrice.queryHandler";
import { GetBookingPriceQuery } from "../../../../src/context/booking/service/getBookingPrice.query";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import { BookingPriceNotFoundException } from "../../../../src/context/booking/exceptions/bookingPriceNotFoundException";


describe("GetBookingPriceQueryHandler", () => {
  let handler: GetBookingPriceQueryHandler;
  let bookingRepository: jest.Mocked<BookingRepository>;

  const mockBookingId = BookingId.generate().toPrimitive();
  const mockPrice = 1500;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookingPriceQueryHandler,
        {
          provide: BookingRepository,
          useValue: {
            getBookingPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetBookingPriceQueryHandler>(GetBookingPriceQueryHandler);
    bookingRepository = module.get(BookingRepository);
  });

  describe("execute", () => {
    it("should return booking price when it exists for ID", async () => {
      bookingRepository.getBookingPrice.mockResolvedValue(mockPrice);
      const query = new GetBookingPriceQuery(mockBookingId);
      const result = await handler.execute(query);
      expect(bookingRepository.getBookingPrice).toHaveBeenCalledWith(new BookingId(mockBookingId));
      expect(result).toBe(mockPrice);
    });

    it("should throw BookingPriceNotFoundException when no price exists for ID", async () => {
      bookingRepository.getBookingPrice.mockResolvedValue(undefined);
      const query = new GetBookingPriceQuery(mockBookingId);
      await expect(handler.execute(query)).rejects.toThrow(BookingPriceNotFoundException);
    });
  });
}); 