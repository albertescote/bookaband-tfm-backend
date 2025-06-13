import { Test, TestingModule } from "@nestjs/testing";
import { UpdateBookingStatusOnContractSignedEventHandler } from "../../../../src/context/booking/service/updateBookingStatusOnContractSigned.eventHandler";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import { EventBus } from "../../../../src/context/shared/eventBus/domain/eventBus";
import { ContractSignedEvent } from "../../../../src/context/shared/eventBus/domain/contractSigned.event";
import { BookingStatusChangedEvent } from "../../../../src/context/shared/eventBus/domain/bookingStatusChanged.event";
import { Booking } from "../../../../src/context/booking/domain/booking";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import ContractId from "../../../../src/context/shared/domain/contractId";
import { BookingNotFoundForContractIdException } from "../../../../src/context/booking/exceptions/bookingNotFoundForContractIdException";
import { UnableToUpdateBookingException } from "../../../../src/context/booking/exceptions/unableToUpdateBookingException";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("UpdateBookingStatusOnContractSignedEventHandler", () => {
  let handler: UpdateBookingStatusOnContractSignedEventHandler;
  let bookingRepository: jest.Mocked<BookingRepository>;
  let eventBus: jest.Mocked<EventBus>;

  const mockContractId = ContractId.generate().toPrimitive();
  const mockBookingId = BookingId.generate().toPrimitive();

  const mockBooking: Booking = {
    contractSigned: jest.fn(),
    getId: jest.fn().mockReturnValue({ toPrimitive: () => mockBookingId }),
    toPrimitives: jest.fn().mockReturnValue({
      id: mockBookingId,
      status: BookingStatus.PENDING,
    }),
  } as unknown as Booking;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBookingStatusOnContractSignedEventHandler,
        {
          provide: BookingRepository,
          useValue: {
            findByContractId: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: "EventBus",
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(UpdateBookingStatusOnContractSignedEventHandler);
    bookingRepository = module.get(BookingRepository);
    eventBus = module.get("EventBus");
  });

  it("should update booking status and publish event when booking exists", async () => {
    bookingRepository.findByContractId.mockResolvedValue(mockBooking);
    bookingRepository.save.mockResolvedValue(mockBooking);
    const event = new ContractSignedEvent(mockContractId);
    await handler.handle(event);
    expect(bookingRepository.findByContractId).toHaveBeenCalledWith(
      new ContractId(mockContractId),
    );
    expect(mockBooking.contractSigned).toHaveBeenCalled();
    expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(BookingStatusChangedEvent),
    );
  });

  it("should throw BookingNotFoundForContractIdException when booking does not exist", async () => {
    bookingRepository.findByContractId.mockResolvedValue(undefined);
    const event = new ContractSignedEvent(mockContractId);
    await expect(handler.handle(event)).rejects.toThrow(
      BookingNotFoundForContractIdException,
    );
  });

  it("should throw UnableToUpdateBookingException when save fails", async () => {
    bookingRepository.findByContractId.mockResolvedValue(mockBooking);
    bookingRepository.save.mockResolvedValue(undefined);
    const event = new ContractSignedEvent(mockContractId);
    await expect(handler.handle(event)).rejects.toThrow(
      UnableToUpdateBookingException,
    );
  });
});
