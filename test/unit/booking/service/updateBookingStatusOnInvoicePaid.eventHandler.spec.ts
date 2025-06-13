import { Test, TestingModule } from "@nestjs/testing";
import { UpdateBookingStatusOnInvoicePaidEventHandler } from "../../../../src/context/booking/service/updateBookingStatusOnInvoicePaid.eventHandler";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import { EventBus } from "../../../../src/context/shared/eventBus/domain/eventBus";
import { InvoicePaidEvent } from "../../../../src/context/shared/eventBus/domain/invoicePaid.event";
import { BookingStatusChangedEvent } from "../../../../src/context/shared/eventBus/domain/bookingStatusChanged.event";
import { Booking } from "../../../../src/context/booking/domain/booking";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import InvoiceId from "../../../../src/context/shared/domain/invoiceId";
import { BookingNotFoundForInvoiceIdException } from "../../../../src/context/booking/exceptions/bookingNotFoundForInvoiceIdException";
import { UnableToUpdateBookingException } from "../../../../src/context/booking/exceptions/unableToUpdateBookingException";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("UpdateBookingStatusOnInvoicePaidEventHandler", () => {
  let handler: UpdateBookingStatusOnInvoicePaidEventHandler;
  let bookingRepository: jest.Mocked<BookingRepository>;
  let eventBus: jest.Mocked<EventBus>;

  const mockInvoiceId = InvoiceId.generate().toPrimitive();
  const mockBookingId = BookingId.generate().toPrimitive();

  const mockBooking: Booking = {
    invoicePaid: jest.fn(),
    getId: jest.fn().mockReturnValue({ toPrimitive: () => mockBookingId }),
    toPrimitives: jest.fn().mockReturnValue({
      id: mockBookingId,
      status: BookingStatus.PAID,
    }),
  } as unknown as Booking;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBookingStatusOnInvoicePaidEventHandler,
        {
          provide: BookingRepository,
          useValue: {
            findByInvoiceId: jest.fn(),
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

    handler = module.get(UpdateBookingStatusOnInvoicePaidEventHandler);
    bookingRepository = module.get(BookingRepository);
    eventBus = module.get("EventBus");
  });

  it("should update booking status and publish event when booking exists", async () => {
    bookingRepository.findByInvoiceId.mockResolvedValue(mockBooking);
    bookingRepository.save.mockResolvedValue(mockBooking);
    const event = new InvoicePaidEvent(mockInvoiceId);
    await handler.handle(event);
    expect(bookingRepository.findByInvoiceId).toHaveBeenCalledWith(
      new InvoiceId(mockInvoiceId),
    );
    expect(mockBooking.invoicePaid).toHaveBeenCalled();
    expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(BookingStatusChangedEvent),
    );
  });

  it("should throw BookingNotFoundForInvoiceIdException when booking does not exist", async () => {
    bookingRepository.findByInvoiceId.mockResolvedValue(undefined);
    const event = new InvoicePaidEvent(mockInvoiceId);
    await expect(handler.handle(event)).rejects.toThrow(
      BookingNotFoundForInvoiceIdException,
    );
  });

  it("should throw UnableToUpdateBookingException when save fails", async () => {
    bookingRepository.findByInvoiceId.mockResolvedValue(mockBooking);
    bookingRepository.save.mockResolvedValue(undefined);
    const event = new InvoicePaidEvent(mockInvoiceId);
    await expect(handler.handle(event)).rejects.toThrow(
      UnableToUpdateBookingException,
    );
  });
});
