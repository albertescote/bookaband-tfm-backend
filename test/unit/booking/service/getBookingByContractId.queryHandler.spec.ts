import { Test, TestingModule } from "@nestjs/testing";
import { GetBookingByContractIdQueryHandler } from "../../../../src/context/booking/service/getBookingByContractId.queryHandler";
import { GetBookingByContractIdQuery } from "../../../../src/context/booking/service/getBookingByContractId.query";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import { Booking } from "../../../../src/context/booking/domain/booking";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";

describe("GetBookingByContractIdQueryHandler", () => {
  let handler: GetBookingByContractIdQueryHandler;
  let bookingRepository: jest.Mocked<BookingRepository>;

  const mockContractId = ContractId.generate().toPrimitive();
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
        GetBookingByContractIdQueryHandler,
        {
          provide: BookingRepository,
          useValue: {
            findByContractId: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetBookingByContractIdQueryHandler>(
      GetBookingByContractIdQueryHandler,
    );
    bookingRepository = module.get(BookingRepository);
  });

  describe("execute", () => {
    it("should return booking primitives when booking exists for contract ID", async () => {
      bookingRepository.findByContractId.mockResolvedValue(mockBooking);
      const query = new GetBookingByContractIdQuery(mockContractId);
      const result = await handler.execute(query);
      expect(bookingRepository.findByContractId).toHaveBeenCalledWith(
        new ContractId(mockContractId),
      );
      expect(result).toEqual(mockBooking.toPrimitives());
    });

    it("should return undefined when no booking exists for contract ID", async () => {
      bookingRepository.findByContractId.mockResolvedValue(undefined);
      const query = new GetBookingByContractIdQuery(mockContractId);
      const result = await handler.execute(query);
      expect(bookingRepository.findByContractId).toHaveBeenCalledWith(
        new ContractId(mockContractId),
      );
      expect(result).toBeUndefined();
    });
  });
});
